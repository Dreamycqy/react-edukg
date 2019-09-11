import React from 'react'
import queryString from 'query-string'
import { Select } from 'antd'

const { Option } = Select

export const getUrlParams = (type) => {
  const parsed = queryString.parse(window.location.search)
  return (type ? parsed[type] : parsed)
}

export const changeUrlQuery = (newQuery) => {
  const query = {
    ...queryString.parse(window.location.search),
    ...newQuery,
  }
  const queryStr = queryString.stringify(query)
  window.history.pushState(null, null, `?${queryStr}`)
}

export const makeOption = (array) => {
  const children = []
  for (const i of array) {
    children.push(<Option key={i.value} value={i.value}>{i.name}</Option>)
  }
  return children
}
