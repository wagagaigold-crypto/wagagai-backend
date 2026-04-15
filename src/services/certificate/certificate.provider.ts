import { Request } from "express";
import { GenResObj } from "../../utils/responseMapper";
import {
  validateCreateCertificate,
  validateDeleteCertificate,
  validateEditCertificate,
} from "./certificate.validator";
import { HttpStatusCodes as Code } from "../../utils/enums";
import {
  buildSearchQuery,
  fetchCertificates,
  formatResponse,
  generateSerialNumbers,
  sanitizeSerialNumber,
} from "./certificate.helper";
import Certificate from "../../schemas/certificates.schema";

export const createCertificates = async (req: Request) => {
  try {
    const { error } = validateCreateCertificate(req.body);
    if (error) {
      return GenResObj(Code.BAD_REQUEST, false, error.details[0].message);
    }

    const { startingSerialNo, endingSerialNo, ...payload } = req.body;

    const { errorMsg, serialNumbers } = generateSerialNumbers(
      startingSerialNo,
      endingSerialNo
    );

    if (errorMsg) {
      return GenResObj(Code.BAD_REQUEST, false, errorMsg);
    }

    const sanitizedSerialNumber = await sanitizeSerialNumber(serialNumbers);

    const createdAt = new Date();
    const documents = sanitizedSerialNumber.map((item) => ({
      ...payload,
      serialNo: item,
      createdAt,
    }));

    const result = await Certificate.insertMany(documents);

    return GenResObj(
      Code.OK,
      true,
      "certificates created successfully",
      result
    );
  } catch (err) {
    return GenResObj(Code.INTERNAL_SERVER, false, (err as Error).message);
  }
};

export const findCertificates = async (req: Request) => {
  try {
    let { page, limit, skip, orderBy, search = "", filters } = req.body;

    page = page || 1;
    limit = limit || 20;
    skip = (page - 1) * limit;

    const query = buildSearchQuery(search, filters);

    const certificates = await fetchCertificates(query, skip, limit, orderBy);

    const totalcertificates = certificates[0]?.total[0]?.count || 0;
    const result = formatResponse(certificates, totalcertificates, page, limit);

    return GenResObj(Code.OK, true, "List of Certificates information", result);
  } catch (err) {
    return GenResObj(Code.INTERNAL_SERVER, false, (err as Error).message);
  }
};

export const findOneCertificate = async (req: Request) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findOne({ serialNo: id });

    if (!certificate) {
      return GenResObj(
        Code.BAD_REQUEST,
        false,
        "No certificates found for the given serial numbers."
      );
    }

    return GenResObj(
      Code.OK,
      true,
      "your Certificates information",
      certificate
    );
  } catch (err) {
    return GenResObj(Code.INTERNAL_SERVER, false, (err as Error).message);
  }
};

export const editCertificate = async (req: Request) => {
  try {
    const { error } = validateEditCertificate(req.body);
    if (error) {
      return GenResObj(Code.BAD_REQUEST, false, error.details[0].message);
    }

    const { serialNo, ...payload } = req.body;

    const updatedCertificate = await Certificate.findOneAndUpdate(
      { serialNo },
      { $set: payload },
      { new: true }
    );

    if (!updatedCertificate) {
      return GenResObj(
        Code.BAD_REQUEST,
        true,
        "Serial No does not match any record"
      );
    }

    return GenResObj(
      Code.OK,
      true,
      "Certificate updated successfully",
      updatedCertificate
    );
  } catch (err) {
    return GenResObj(Code.INTERNAL_SERVER, false, (err as Error).message);
  }
};

export const deleteCertificates = async (req: Request) => {
  try {
    const { error } = validateDeleteCertificate(req.body);
    if (error) {
      return GenResObj(Code.BAD_REQUEST, false, error.details[0].message);
    }

    const { serialNos } = req.body;

    const deleteResult = await Certificate.deleteMany({
      serialNo: { $in: serialNos },
    });

    if (deleteResult.deletedCount === 0) {
      return GenResObj(
        Code.BAD_REQUEST,
        false,
        "No certificates found for the given serial numbers."
      );
    }

    return GenResObj(
      Code.OK,
      true,
      "Certificates deleted successfully",
      deleteResult
    );
  } catch (err) {
    return GenResObj(Code.INTERNAL_SERVER, false, (err as Error).message);
  }
};

export const dashboard = async (req: Request) => {
  try {
    const [allCertificates, activeCertificates] = await Promise.all([
      Certificate.countDocuments({}),
      Certificate.countDocuments({ status: { $ne: "inactive" } }),
    ]);

    return GenResObj(Code.OK, true, "", {
      all: allCertificates,
      active: activeCertificates,
      inactive: allCertificates - activeCertificates,
    });
  } catch (err) {
    console.log("🚀 ~ dashboard ~ err:", err);
    return GenResObj(Code.INTERNAL_SERVER, false, (err as Error).message);
  }
};
