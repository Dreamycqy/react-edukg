import qs from 'qs'
import request from '../utils/request'

export function getGraphBySubandGrade(body, rSymbol) {
  return request.post({
    url: '/api/typeNew/res_lib/selfadaption/res/instanceInfoList',
    data: body,
    rSymbol,
  })
}

export function getGraphNodeDetail(body, rSymbol) {
  return request.get({
    url: '/api/typeNew/apikm/instanceinfo',
    data: body,
    rSymbol,
  })
}

export function getEduEbooks(body, rSymbol) {
  return request.post({
    url: '/api/typeNew/apiresourceinfo/list',
    data: qs.stringify(body),
    rSymbol,
  })
}

export function getNews(body, rSymbol) {
  return request.get({
    url: '/api/typeXinwen/svc/xlore/queryRelatedNews',
    data: body,
    rSymbol,
  })
}

export function getVideos(body, rSymbol) {
  return request.get({
    url: '/api/typeNew/res_lib/selfadaption/res/listVideo',
    data: body,
    rSymbol,
  })
}

export function getExtraEbooks(body, rSymbol) {
  return request.post({
    url: '/api/typeNew/apiextrabook/list',
    data: qs.stringify(body),
    rSymbol,
  })
}

export function getEduEbooksDetail(body, rSymbol) {
  return request.post({
    url: '/api/typeNew/apiresourceinfo/getbyid',
    data: qs.stringify(body),
    rSymbol,
  })
}

export function getEduEbooksPage(id, rSymbol) {
  return request.get({
    url: `/api/typeNew/res_lib/apihtml/gethtmlwithoutlogin/${id}`,
    data: {},
    rSymbol,
  })
}

export function getQuestion(body, rSymbol) {
  return request.get({
    url: '/api/typeNew/res_lib/tiku/getRandQuestions',
    data: body,
    rSymbol,
  })
}

export function checkQuestionAnswer(body, rSymbol) {
  return request.get({
    url: '/api/typeNew/res_lib/tiku/checkQuestionAnswer',
    data: body,
    rSymbol,
  })
}
