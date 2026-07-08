export function successResponse(res, data, message = "Success", statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    error: false,
    ...(data !== undefined && { data }),
  });
}

export function errorResponse(res, message, statusCode = 500, errors = null) {
  const response = {
    success: false,
    message,
    error: true,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
}

export function paginatedResponse(res, data, total, page, limit, message = "Success") {
  return res.status(200).json({
    success: true,
    message,
    error: false,
    data,
    total,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
  });
}
