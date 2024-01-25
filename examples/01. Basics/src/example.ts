import { _u } from '@tinytales/_underline'

export default function runExample() {
  row1()
  row2()
}

const row1 = () => {
  _u.begin('row1')
  // Moving the parent position moves all children
  _u.position(100, 0)

  _u.begin('row1 > red')
  _u.fill('#FF0000')
  _u.dimension(150, 150)

  _u.begin('row1 > green')
  _u.fill('#00FF44')
  _u.dimension(150, 150)
  // To not have green and blue stack on top of red
  // We have to manually move the position
  // (based of the parents position)
  _u.position(150, 0)

  _u.begin('row1 > blue')
  _u.fill('#0033FF')
  _u.dimension(150, 150)
  // Here flex row would have been the better choice,
  // But we are just starting out ;)
  _u.position(300, 0)
}

const row2 = () => {
  _u.begin('row2')
  _u.position(0, 250)

  _u.begin('row2 > red2')
  _u.fill('#FF0000')
  _u.dimension(150, 150)
}
