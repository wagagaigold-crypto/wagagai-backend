import Joi from "joi";

export const validateCreateCertificate = (data: any) => {
  const schema = Joi.object({
    startingSerialNo: Joi.string().required(),
    endingSerialNo: Joi.string().required(),
    metalType: Joi.string().required(),
    weight: Joi.string().required(),
    manufactureYear: Joi.number().required(),
    purity: Joi.string().required(),
    batchNo: Joi.string().required(),
    status: Joi.string()
      .valid("active", "inactive")
      .default("active")
      .optional(),
  });
  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

export const validateFindOneCertificate = (data: any) => {
  const schema = Joi.object({
    id: Joi.string().required(),
  });
  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

export const validateEditCertificate = (data: any) => {
  const schema = Joi.object({
    serialNo: Joi.string().required(),
    metalType: Joi.string().required(),
    weight: Joi.string().required(),
    manufactureYear: Joi.number().required(),
    purity: Joi.string().required(),
    batchNo: Joi.string().required(),
    status: Joi.string().valid("active", "inactive").required(),
  });
  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};

export const validateDeleteCertificate = (data: any) => {
  const schema = Joi.object({
    serialNos: Joi.array().items(Joi.string().required()).min(1).required(),
  });
  return schema.validate(data, { abortEarly: false, allowUnknown: true });
};
