import Certificate from "../../schemas/certificates.schema";
import { IGenerateSerialNumbers } from "./certificate.interface";

const extractParts = (serial: string) => {
  const match = serial.match(/^(.*?)(\d+)$/);
  if (!match) {
    throw new Error("Serial number must have both prefix and numeric part.");
  }
  return {
    prefix: match[1],
    number: parseInt(match[2], 10),
    numberLength: match[2].length,
  };
};

export const generateSerialNumbers = (
  startSerial: string,
  endSerial: string
) => {
  const result: IGenerateSerialNumbers = {
    errorMsg: null,
    serialNumbers: [],
  };

  try {
    const { prefix: startPrefix, number: startNumber } =
      extractParts(startSerial);

    const { numberLength } = extractParts(endSerial);

    const { prefix: endPrefix, number: endNumber } = extractParts(endSerial);

    if (startPrefix !== endPrefix) {
      result.errorMsg =
        "Prefixes of start and end serial numbers must be the same.";
      return result;
    }

    if (startNumber > endNumber) {
      result.errorMsg =
        "Start serial number should not be greater than end serial number.";
      return result;
    }

    // Generate the list of serial numbers
    for (let i = startNumber; i <= endNumber; i++) {
      const paddedNumber = i.toString().padStart(numberLength, "0");
      result.serialNumbers.push(`${startPrefix}${paddedNumber}`);
    }

    if (result.serialNumbers.length === 0) {
      result.errorMsg =
        "Cannot process more than 0 serial numbers in a single request.";
      return result;
    }

    if (result.serialNumbers.length > 100) {
      result.errorMsg =
        "Cannot process more than 100 serial numbers in a single request.";
      return result;
    }
  } catch (err) {
    result.errorMsg = (err as Error).message;
  }

  return result;
};

export const sanitizeSerialNumber = async (serialNos: string[]) => {
  try {
    const existingSerials = await Certificate.find({
      serialNo: { $in: serialNos },
    }).select("serialNo");
    if (existingSerials.length > 0) {
      throw new Error("Serial number already exists");
    }

    const existingSerialNos = existingSerials.map((doc) => doc.serialNo);

    return serialNos.filter(
      (serialNo) => !existingSerialNos.includes(serialNo)
    );
  } catch (err) {
    throw err;
  }
};

export const buildSearchQuery = (search: string, filters: any) => {
  const query: any = {
    $or: [
      { serialNo: { $regex: search, $options: "i" } },
      { metalType: { $regex: search, $options: "i" } },
      { weight: { $regex: search, $options: "i" } },
      { purity: { $regex: search, $options: "i" } },
      { manufactureYear: { $regex: search, $options: "i" } },
    ],
  };

  if (filters?.metalType) {
    query.metalType = filters.metalType;
  }

  if (filters?.startDate || filters?.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.createdAt.$lte = new Date(filters.endDate);
    }
  }

  if (filters?.manufactureYear) {
    query.manufactureYear = Number(filters.manufactureYear);
  }

  if (filters?.purity) {
    query.purity = filters.purity;
  }

  if (filters?.weight) {
    query.weight = filters.weight;
  }

  if (filters?.status) {
    query.status = filters.status;
  }

  return query;
};

export const fetchCertificates = async (
  query: any,
  skip: number,
  limit: number,
  orderBy: any
) => {
  try {
    return await Certificate.aggregate([
      { $match: query },
      {
        $facet: {
          total: [{ $count: "count" }],
          data: [
            { $sort: orderBy || { createdAt: -1, serialNo: -1, _id: -1 } },
            { $skip: skip },
            { $limit: limit },
          ],
        },
      },
    ]);
  } catch (err) {
    throw err;
  }
};

export const formatResponse = (
  certificates: any,
  totalCertificates: number,
  page: number,
  limit: number
) => {
  const totalPages = Math.ceil(totalCertificates / limit);
  const nextPageExists = page < totalPages;

  return {
    certificates: certificates[0]?.data || [],
    total: totalCertificates,
    totalPages: totalPages,
    nextPageExists: nextPageExists,
    previousPage: page > 1 ? page - 1 : null,
  };
};
