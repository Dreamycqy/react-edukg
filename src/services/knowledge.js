import qs from 'qs'
import request from '../utils/request'

export function questionListByUriName(body, rSymbol) {
  return request.get({
    url: '/api/knowledge/wiki/questionListByUriName',
    data: body,
    rSymbol,
  })
}

export function searchResult(body, rSymbol) {
  return request.get({
    url: '/api/knowledge/wiki/search',
    data: body,
    rSymbol,
  })
}

export function searchByKnowId(body, rSymbol) {
  return request.get({
    url: '/api/knowledge/wiki/searchByKnowId',
    data: body,
    rSymbol,
  })
}

export function searchByKnowName(body, rSymbol) {
  return request.get({
    url: '/api/knowledge/wiki/searchByKnowName',
    data: body,
    rSymbol,
  })
}