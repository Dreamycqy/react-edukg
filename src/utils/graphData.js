export const graphData = (data, course) => {
  const nodes = []
  const links = []
  const forcename = data.content.self.label
  nodes.push({
    category: '0',
    name: forcename,
    symbolSize: 60, // 节点大小
    uri: data.content.self.uri,
    course,
    symbol: data.content.self.type === 'rdftype' ? 'rect' : 'circle',
    draggable: true,
    label: {
      normal: {
        show: true,
        position: 'inside',
        formatter: '{b}',
        fontSize: 16,
        fontStyle: '100',
      },
    },
  })
  const predicateList = {}
  data.content.list.forEach((item) => { // 归类
    if (item.predicate !== null) {
      if (!predicateList[item.predicate]) {
        predicateList[item.predicate] = []
      }
      predicateList[item.predicate].push(item)
    } else {
      if (!predicateList['nullNodes']) {
        predicateList['nullNodes'] = []
      }
      predicateList['nullNodes'].push(item)
    }
  })
  for (const i in predicateList) { // eslint-disable-line
    if (i !== 'nullNodes') {
      if (predicateList[i].length > 2) { // 子节点数量大于2则成集
        nodes.push({
          name: `${i} 集`,
          category: '1', // 二级父节点
          symbolSize: 36, // 节点大小
          uri: '',
          course,
          open: false,
          symbol: 'circle',
          draggable: true,
          label: {
            normal: {
              show: true,
              position: 'inside',
              formatter: '{b}',
              fontSize: 14,
              fontStyle: '100',
            },
          },
        })
        links.push({
          source: forcename,
          target: `${i} 集`,
        })
        predicateList[i].forEach((e) => {
          nodes.push({
            name: `${e.label} (${i})`,
            category: '2', // 叶子节点
            symbolSize: 10, // 节点大小
            uri: e.uri,
            course,
            showLeaf: false,
            symbol: 'circle',
            label: {
              normal: {
                show: true,
                position: 'top',
                formatter: '{b}',
                fontSize: 10,
                fontStyle: '100',
              },
            },
          })
          links.push({
            source: `${i} 集`,
            target: `${e.label} (${i})`,
          })
        })
      } else {
        predicateList[i].forEach((e) => {
          nodes.push({
            name: e.label,
            category: '3', // 二级非父节点
            symbolSize: 36, // 节点大小
            uri: e.uri,
            course,
            symbol: e.type === 'rdftype' ? 'rect' : 'circle',
            draggable: true,
            label: {
              normal: {
                show: true,
                position: 'inside',
                formatter: '{b}',
                fontSize: 14,
                fontStyle: '100',
              },
            },
          })
          links.push({
            source: forcename,
            target: e.label,
          })
        })
      }
    } else {
      predicateList[i].forEach((e) => {
        nodes.push({
          name: e.label,
          category: '3', // 二级非父节点且predicate为null
          symbolSize: 36, // 节点大小
          uri: e.uri,
          course,
          symbol: e.type === 'rdftype' ? 'rect' : 'circle',
          draggable: true,
          label: {
            normal: {
              show: true,
              position: 'inside',
              formatter: '{b}',
              fontSize: 14,
              fontStyle: '100',
            },
          },
        })
        links.push({
          source: forcename,
          target: e.label,
        })
      })
    }
  }
  return { nodes, links, forcename }
}
