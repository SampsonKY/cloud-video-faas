function res_obj(err, data?) {
  return {
    error: err,
    data: data || {},
  };
}

export default res_obj;
