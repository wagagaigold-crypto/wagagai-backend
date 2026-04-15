import { Request, Response } from "express";
import * as CertificateProvider from "./certificate.provider";
import { TResponse } from "../../utils/commonInterface";
import { generateCertificatePDF } from "./certificate.pdf";

export const certificateController = {
  create: async (req: Request, res: Response) => {
    const { code, data }: TResponse =
      await CertificateProvider.createCertificates(req);
    res.status(code).json(data);
    return;
  },

  find: async (req: Request, res: Response) => {
    const { code, data }: TResponse =
      await CertificateProvider.findCertificates(req);
    res.status(code).json(data);
    return;
  },

  findOne: async (req: Request, res: Response) => {
    const { code, data }: TResponse =
      await CertificateProvider.findOneCertificate(req);
    res.status(code).json(data);
    return;
  },

  edit: async (req: Request, res: Response) => {
    const { code, data }: TResponse = await CertificateProvider.editCertificate(
      req
    );
    res.status(code).json(data);
    return;
  },

  remove: async (req: Request, res: Response) => {
    const { code, data }: TResponse =
      await CertificateProvider.deleteCertificates(req);
    res.status(code).json(data);
    return;
  },

  dashboard: async (req: Request, res: Response) => {
    const { code, data }: TResponse = await CertificateProvider.dashboard(req);
    res.status(code).json(data);
    return;
  },

  downloadPdf: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { code, data }: TResponse =
        await CertificateProvider.findOneCertificate(req);

      if (code !== 200 || !data?.success) {
        res.status(code).json(data);
        return;
      }

      const cert = data.data;
      const pdfBuffer = await generateCertificatePDF({
        serialNo: cert.serialNo,
        metalType: cert.metalType,
        weight: cert.weight,
        purity: cert.purity,
        manufactureYear: cert.manufactureYear,
        batchNo: cert.batchNo,
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=wagagai-certificate-${cert.serialNo}.pdf`
      );
      res.send(pdfBuffer);
    } catch (err) {
      res.status(500).json({ success: false, message: (err as Error).message });
    }
  },
};
