import qs from 'qs'
import request from '../utils/request'

export function getPermission(body, rSymbol) {
  return request.post({
    url: '/sekg/api/getPermission',
    data: body,
    dataType: 'text',
    rSymbol,
  })
}

export function search(body, rSymbol) {
  return request.get({
    url: '/sekg/api/totalsearch',
    data: body,
    rSymbol,
  })
}

export function detailTable(body, rSymbol) {
  return request.get({
    url: '/sekg/api/changebyinstancelist',
    data: body,
    rSymbol,
  })
}

export function graphSearch(body, rSymbol) {
  return request.get({
    url: '/sekg/api/instanceList',
    data: body,
    rSymbol,
  })
}

export function qaSearch(body, rSymbol) {
  return request.post({
    url: '/sekg/api/course/inputQuestion',
    data: qs.stringify(body),
    rSymbol,
  })
}

export function kCardSearch(body, rSymbol) {
  return request.post({
    url: '/sekg/api/kCardSearch',
    data: qs.stringify(body),
    rSymbol,
  })
}

export function detailCard(body, rSymbol) {
  return request.post({
    url: '/sekg/api/getKnowledgeCard',
    data: qs.stringify(body),
    rSymbol,
  })
}

export function relatedPage(body, rSymbol) {
  return request.post({
    url: '/sekg/api/relatedsubject',
    data: qs.stringify(body),
    rSymbol,
  })
}

export function callBack(body, rSymbol) {
  return request.post({
    url: '/sekg/api/callBack',
    data: qs.stringify(body),
    rSymbol,
  })
}

export function querygraph(body, rSymbol) {
  return request.post({
    url: '/sekg/api/querygraph',
    data: qs.stringify(body),
    rSymbol,
  })
}

export function queryByUri(body, rSymbol) {
  return request.post({
    url: '/sekg/api/queryByUri',
    data: qs.stringify(body),
    rSymbol,
  })
}

export function getInstGraph(body, rSymbol) {
  return request.get({
    url: '/sekg/api/getInstGraph',
    data: body,
    rSymbol,
  })
}

export function fyTotal(body, rSymbol) {
  return request.get({
    url: '/sekg/api/fytotalsearch',
    data: body,
    rSymbol,
  })
}

export function newSearch(body, rSymbol) {
  return request.get({
    url: '/sekg/api/science/search',
    data: body,
    rSymbol,
  })
}

export function newResult(body, rSymbol) {
  return request.get({
    url: '/sekg/api/science/querygraphByUri',
    data: body,
    rSymbol,
  })
}

export function getClassTree(body, rSymbol) {
  return request.get({
    url: '/sekg/api/science/classList',
    data: body,
    rSymbol,
  })
}
