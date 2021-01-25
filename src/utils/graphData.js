const test = /^[A-Za-z]+$/i
export const remakeGraphData = (list, forcename) => {
  window.location.href = '#components-anchor-graph'
  const nodes = []
  const links = []
  const tableResult = {}
  const temp = {}
  list.forEach((e) => {
    if (!e.predicate_label) {
      e.predicate_label = '实体'
    }
    if (!temp[e.predicate_label] && e.predicate_label.indexOf('科普') < 0) {
      temp[e.predicate_label] = []
    }
    if (e.predicate_label.indexOf('科普') < 0) {
      temp[e.predicate_label].push(e)
    }
  })
  for (const colle in temp) { // eslint-disable-line
    if (temp[colle].length > 2) {
      nodes.push({
        name: `${colle} (集)`,
        oriName: colle,
        category: '1', // 二级父节点
        symbolSize: 36, // 节点大小
        uri: '',
        open: false,
        symbol: temp[colle].length > 50 ? 'rect' : 'circle',
        edgeSymbol: ['circle', 'arrow'],
        edgeSymbolSize: [4, 10],
        draggable: true,
        isTable: temp[colle].length > 50,
        label: {
          normal: {
            show: true,
            position: 'bottom',
            formatter: (val) => { // eslint-disable-line
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
      links.push({
        source: `${colle} (集)`,
        target: forcename,
      })
      if (temp[colle].length <= 50) {
        temp[colle].forEach((e) => { // eslint-disable-line
          nodes.push({
            name: e.object_label || e.subject_label,
            category: '2', // 叶子节点
            symbolSize: 16, // 节点大小
            uri: e.object || e.subject,
            showLeaf: false,
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
          links.push({
            source: e.object_label || e.subject_label,
            target: `${colle} (集)`,
          })
        })
      } else {
        tableResult[colle] = temp[colle]
      }
    } else {
      temp[colle].forEach((e) => { // eslint-disable-line
        nodes.push({
          name: e.object_label || e.subject_label,
          category: '2', // 叶子节点
          symbolSize: 16, // 节点大小
          uri: e.object || e.subject,
          showLeaf: false,
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
        links.push({
          source: e.object_label || e.subject_label,
          target: forcename,
        })
      })
    }
  }
  return { nodes, links, tableResult }
}
