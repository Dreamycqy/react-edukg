import _ from 'lodash'

const test = /^[A-Za-z]+$/i
export const remakeGraphData = (list, forcename) => {
  window.location.href = '#components-anchor-graph'
  const nodes = [{
    name: forcename,
    category: '0',
    symbolSize: 60,
    symbol: 'circle',
    edgeSymbol: ['circle', 'arrow'],
    edgeSymbolSize: [4, 10],
    draggable: true,
    label: {
      normal: {
        show: true,
        position: 'bottom',
        formatter: (val) => {
          const strs = val.data.name.replace(' ', '\n').split('')
          let str = ''
          for (let j = 0, s; s = strs[j++];) {
            str += s
            if (!(j % 8) && !test.test(s)) str += '\n'
          }
          return str
        },
        textStyle: {
          color: '#000000',
          fontWeight: 'normal',
          fontSize: '12',
        },
      },
    },
  }]
  const links = []
  const temp = {}
  const newTemp = {}
  const treeData = []
  list.forEach((e) => {
    if (!e.predicate_label) {
      e.predicate_label = '实体'
    }
    if (!temp[e.predicate_label] && e.predicate_label.indexOf('科普') < 0) {
      temp[e.predicate_label] = []
    }
    if (e.predicate_label.indexOf('科普') < 0) {
      if (e.predicate_label === '实体限制') {
        if (!temp['相关特征']) {
          temp['相关特征'] = []
        }
        temp['相关特征'].push(e)
      } else {
        temp[e.predicate_label].push(e)
      }
    }
  })
  for (const i in temp) { // eslint-disable-line
    newTemp[i] = {
      title: i,
      key: i,
      children: _.uniqBy(temp[i].map((e) => {
        return {
          title: e.object_label || e.subject_label,
          key: e.object_label || e.subject_label,
          children: [],
        }
      }), 'title').filter((e) => { return e.title.indexOf('实体') < 0 }),
    }
  }
  for (const j in newTemp) { // eslint-disable-line
    if (newTemp[j].children.length > 0) {
      treeData.push(newTemp[j])
    }
  }
  for (const colle in temp) { // eslint-disable-line
    if (temp[colle].length) {
      temp[colle].forEach((e) => { // eslint-disable-line
        const name = e.object_label || e.subject_label
        nodes.push({
          name,
          colle,
          category: colle, // 叶子节点
          symbolSize: 16 + (20 / temp[colle].length), // 节点大小
          uri: e.object || e.subject,
          showLeaf: true,
          show: true,
          symbol: 'circle',
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 10],
          draggable: true,
          label: {
            normal: {
              show: true,
              position: 'bottom',
              formatter: (val) => {
                const strs = val.data.name.replace(' ', '\n').split('')
                let str = ''
                for (let j = 0, s; s = strs[j++];) {
                  str += s
                  if (!(j % 8) && !test.test(s)) str += '\n'
                }
                return str
              },
              textStyle: {
                color: '#000000',
                fontWeight: 'normal',
                fontSize: '12',
              },
            },
          },
        })
        if (!_.find(links, { source: name, colle })) {
          links.push({
            source: name,
            target: forcename,
            colle,
            value: (temp[colle].length),
            label: {
              show: true,
              formatter: () => colle,
            },
          })
        }
      })
    }
  }
  const nodesResult = _.uniqBy(nodes, 'name')
  return { nodes: nodesResult, links, treeData }
}
