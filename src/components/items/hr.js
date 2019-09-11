import React from 'react'

class Hr extends React.Component {
  render() {
    return (
      <hr
        style={{
          display: 'block',
          height: 3,
          width: `${this.props.width}%`,
          left: `${(100 - this.props.width) / 2}%`,
          position: 'relative',
          padding: 0,
          border: 'none',
          backgroundImage: '-webkit-linear-gradient(left, rgba(255, 255, 255, 0), #71c9d6, rgba(255, 255, 255, 0))',
        }}
      />
    )
  }
}

export default Hr
