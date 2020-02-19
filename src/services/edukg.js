import qs from 'qs'
import request from '../utils/request'

export function getPermission(body, rSymbol) {
  return request.post({
    url: '/edukg/api/getPermission',
    data: body,
    dataType: 'text',
    rSymbol,
  })
}

export function search(body, rSymbol) {
  return request.get({
    url: '/edukg/api/totalsearch',
    data: body,
    rSymbol,
  })
}

export function detailTable(body, rSymbol) {
  return request.get({
    url: '/edukg/api/changebyinstancelist',
    data: body,
    rSymbol,
  })
}

export function graphSearch(body, rSymbol) {
  return request.get({
    url: '/edukg/api/instanceList',
    data: body,
    rSymbol,
  })
}

export function qaSearch(body, rSymbol) {
  return request.post({
    url: '/edukg/api/course/inputQuestion',
    data: qs.stringify(body),
    rSymbol,
  })
}

export function kCardSearch(body, rSymbol) {
  return request.post({
    url: '/edukg/api/kCardSearch',
    data: qs.stringify(body),
    rSymbol,
  })
}

export function detailCard(body, rSymbol) {
  return request.post({
    url: '/edukg/api/getKnowledgeCard',
    data: qs.stringify(body),
    rSymbol,
  })
}

export function relatedPage(body, rSymbol) {
  return request.post({
    url: '/edukg/api/relatedsubject',
    data: qs.stringify(body),
    rSymbol,
  })
}

export function callBack(body, rSymbol) {
  return request.post({
    url: '/edukg/api/callBack',
    data: qs.stringify(body),
    rSymbol,
  })
}

export function querygraph(body, rSymbol) {
  return request.post({
    url: '/edukg/api/querygraph',
    data: qs.stringify(body),
    rSymbol,
  })
}

export function queryByUri(body, rSymbol) {
  return request.post({
    url: '/edukg/api/queryByUri',
    data: qs.stringify(body),
    rSymbol,
  })
}

export function getInstGraph(body, rSymbol) {
  return request.get({
    url: '/edukg/api/getInstGraph',
    data: body,
    rSymbol,
  })
}

export function fyTotal(body, rSymbol) {
  return request.get({
    url: '/edukg/api/fytotalsearch',
    data: body,
    rSymbol,
  })
}
