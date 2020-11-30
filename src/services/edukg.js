import request from '../utils/request'

export function newSearch(body, rSymbol) {
  return request.get({
    url: '/api/science/search',
    data: body,
    rSymbol,
  })
}

export function newResult(body, rSymbol) {
  return request.get({
    url: '/api/science/querygraphByUri',
    data: body,
    rSymbol,
  })
}

export function getClassTree(body, rSymbol) {
  return request.get({
    url: '/api/science/classList',
    data: body,
    rSymbol,
  })
}
