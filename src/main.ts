import './style.css'

let x = 0
let y = 0

document.body.addEventListener('mousemove', (event: MouseEvent) => {
  x = event.clientX
  y = event.clientY
  document.body.style.backgroundColor = `rgb(${x}, ${y}, 100)`
})
