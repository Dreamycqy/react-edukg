import React from 'react'
import { Input, Button } from 'antd'
import router from 'umi/router'
import { connect } from 'dva'
import { routerRedux } from 'dva/router'
import Hr from '@/components/items/hr'
import dictionary from '@/constants/dictionary'
import banner from '@/assets/banner.png'
import styles from './index.css'

const InputGroup = Input.Group

function mapStateToProps(state) {
  const { locale } = state.global
  return {
    locale,
  }
}
@connect(mapStateToProps)
class Home extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchKey: '',
    }
  }

  handleSearch = () => {
    router.push({
      pathname: '/total',
      query: {
        searchKey: this.state.searchKey,
      },
    })
  }

  render() {
    const { searchKey } = this.state
    const { locale } = this.props
    return (
      <div style={{ marginTop: -60 }}>
        <div className={styles.headerwrap}>
          <header className={styles.clearfix}>
            <h1 style={{ marginBottom: 0 }}>eduKG</h1>
            <p>Knowledge Graph of K12 Education</p>
            <span className={styles.jcjutp}>&nbsp;基础教育知识图谱&nbsp;</span>
          </header>
          <div className={styles.totalsearch}>
            <InputGroup compact>
              <Input
                size="large"
                value={searchKey}
                onChange={e => this.setState({ searchKey: e.target.value })}
                onPressEnter={() => this.handleSearch()}
                placeholder={dictionary.placeholder[locale]}
                style={{
                  width: 540,
                }}
              />
              <Button
                style={{ width: 90 }}
                size="large"
                type="primary"
                onClick={() => this.handleSearch()}
              >
                {dictionary.searchButton[locale]}
              </Button>
            </InputGroup>
          </div>
          <div
            style={{ marginTop: 10, cursor: 'pointer' }}
            onClick={() => {
              this.props.dispatch(routerRedux.push({
                pathname: '/fy',
                query: {
                },
              }))
            }}
          >
            <img alt="" src={banner} width="630px" height="42px" />
          </div>
        </div>
        <div className={styles.about}>
          <div className={styles.container}>
            <div className={styles.row}>
              <h2 className={styles.centered}>{dictionary.titleIntro[locale]}</h2>
              <Hr width={50} />
              <div className={styles.callout}>
                <div className={styles.colLgOffset5}>

                  <img className={styles.kbpng} alt="" src={require('@/assets/kb.png')} />
                </div>
                <h3>{dictionary.titleIntro.subTitle1[locale]}</h3>
                <p>{dictionary.titleIntro.subTitle1.content[locale]}</p>
              </div>
              <div className={styles.callout}>
                <div className={styles.colLgOffset5}>

                  <img className={styles.searchpng} style={{ marginBottom: 20 }} alt="" src={require('@/assets/search.png')} />
                </div>
                <h3>{dictionary.titleIntro.subTitle2[locale]}</h3>
                <p>{dictionary.titleIntro.subTitle2.content[locale]}</p>
              </div>
              <div className={styles.callout}>
                <div className={styles.colLgOffset5}>
                  &nbsp;&nbsp;&nbsp;
                  <img className={styles.qapng} alt="" src={require('@/assets/qa.png')} />
                </div>
                <h3>{dictionary.titleIntro.subTitle3[locale]}</h3>
                <p>{dictionary.titleIntro.subTitle3.content[locale]}</p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.services}>
          <div className={styles.container}>
            <div className={styles.row}>
              <h2 className={styles.centered}>{dictionary.titleGraph[locale]}</h2>
              <Hr width={70} />
              <div className={styles.imgImg}>
                <img alt="" src={require('@/assets/knowledge.png')} />
                <br />
                <br />
                <p>{dictionary.titleGraph.card1[locale]}</p>
              </div>
              <div className={styles.imgJ}>
                <img alt="" src={require('@/assets/j.png')} />
              </div>
              <div className={styles.imgImg}>
                <img alt="" src={require('@/assets/labelpic.png')} />
                <br />
                <br />
                <p>{dictionary.titleGraph.card2[locale]}</p>
              </div>
              <div className={styles.imgJ}>
                <img alt="" src={require('@/assets/j.png')} />
              </div>
              <div className={styles.imgImg}>
                <img style={{ width: 100, height: 100 }} alt="" src={require('@/assets/completion.png')} />
                <br />
                <br />
                <p>{dictionary.titleGraph.card3[locale]}</p>
              </div>
              <div className={styles.imgJ}>
                <img alt="" src={require('@/assets/j.png')} />
              </div>
              <div className={styles.imgImg}>
                <img style={{ width: 80, height: 80, marginBottom: 10 }} alt="" src={require('@/assets/extract.png')} />
                <br />
                <br />
                <p>{dictionary.titleGraph.card4[locale]}</p>
              </div>
              <div className={styles.imgJ}>
                <img alt="" src={require('@/assets/j.png')} />
              </div>
              <div className={styles.imgImg}>
                <img alt="" src={require('@/assets/fuse.png')} />
                <br />
                <br />
                <p>{dictionary.titleGraph.card5[locale]}</p>
              </div>
              <div className={styles.colLg10} style={{ border: '1px dashed #a6dff4', borderRadius: 10, margin: '40px 0 0 100px' }}>
                <span className={styles.graphintro_span}>
                  {dictionary.titleGraph.subTitle[locale]}
                </span>
                <br />
                <br />
                <br />
                <p className={styles.graphintro_p}>
                  {dictionary.titleGraph.context[locale]}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.portfolio}>
          <div className={styles.container} style={{ textAlign: 'left' }}>
            <div className={styles.row}>
              <h2 className={styles.centered}>{dictionary.titleQa[locale]}</h2>
              <Hr width={50} />
              <div className={styles.colLg10} style={{ marginLeft: '8.33333333%' }}>
                <img className={styles.qa_jpg} style={{ float: 'left' }} alt="" src={require('@/assets/qa.jpg')} />
                <div className={styles.qa_exp_div}>
                  <p className={styles.p1}>
                    {dictionary.titleQa.example[locale]}
                  </p>
                  <p className={styles.qa_exp_p} style={{ borderBottom: '1px solid #d2d1d0', borderTop: '1px solid #d2d1d0' }}>
                    <span style={{ color: '#9cdbdc' }}>▲</span>
                    {dictionary.titleQa.question1[locale]}
                  </p>
                  <p className={styles.qa_exp_p}>
                    <span style={{ color: '#3b12bd' }}>▲</span>
                    {dictionary.titleQa.question2[locale]}
                  </p>
                </div>
                <div className={styles.clearfloat} style={{ clear: 'right' }} />
              </div>
              <div
                className={styles.colLg10} style={{
                  border: '1px solid #d2d0cd', borderRadius: 10, marginTop: 60, marginLeft: 100,
                }}
              >
                <span className={styles.qa_intro_span} style={{ fontFamily: 'none' }}>
                  {dictionary.titleQa.subTitle[locale]}
                </span>
                <br />
                <br />
                <br />
                <p>
                  {dictionary.titleQa.context[locale]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Home
