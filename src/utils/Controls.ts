import { Call } from '@stream-io/video-client'

const renderAudioButton = (call: Call) => {
  const audioButton = document.createElement('button')
  audioButton.classList.add('control-button')

  audioButton.addEventListener('click', async () => {
    await call.microphone.toggle()
  })

  call.microphone.state.status$.subscribe((status) => {
    audioButton.innerHTML =
      status === 'enabled'
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
<path opacity="0.15" d="M13 3L7 8H5C3.89543 8 3 8.89543 3 10V14C3 15.1046 3.89543 16 5 16H7L13 21V3Z" fill="#000000"/>
<path d="M16 9L22 15M22 9L16 15M13 3L7 8H5C3.89543 8 3 8.89543 3 10V14C3 15.1046 3.89543 16 5 16H7L13 21V3Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
<path opacity="0.15" d="M13 3L7 8H5C3.89543 8 3 8.89543 3 10V14C3 15.1046 3.89543 16 5 16H7L13 21V3Z" fill="#000000"/>
<path d="M16 8.99998C16.5 9.49999 17 10.5 17 12C17 13.5 16.5 14.5 16 15M19 6C20.5 7.5 21 10 21 12C21 14 20.5 16.5 19 18M13 3L7 8H5C3.89543 8 3 8.89543 3 10V14C3 15.1046 3.89543 16 5 16H7L13 21V3Z" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
  })

  return audioButton
}

const renderVideoButton = (call: Call) => {
  const videoButton = document.createElement('button')
  videoButton.classList.add('control-button')

  videoButton.addEventListener('click', async () => {
    await call.camera.toggle()
  })

  call.camera.state.status$.subscribe((status) => {
    videoButton.innerHTML =
      status === 'enabled'
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
<path d="M3 3L6.00007 6.00007M21 21L19.8455 19.8221M9.74194 4.06811C9.83646 4.04279 9.93334 4.02428 10.0319 4.01299C10.1453 4 10.2683 4 10.5141 4H13.5327C13.7786 4 13.9015 4 14.015 4.01299C14.6068 4.08078 15.1375 4.40882 15.4628 4.90782C15.5252 5.00345 15.5802 5.11345 15.6901 5.33333C15.7451 5.44329 15.7726 5.49827 15.8037 5.54609C15.9664 5.79559 16.2318 5.95961 16.5277 5.9935C16.5844 6 16.6459 6 16.7688 6H17.8234C18.9435 6 19.5036 6 19.9314 6.21799C20.3077 6.40973 20.6137 6.71569 20.8055 7.09202C21.0234 7.51984 21.0234 8.0799 21.0234 9.2V15.3496M19.8455 19.8221C19.4278 20 18.8702 20 17.8234 20H6.22344C5.10333 20 4.54328 20 4.11546 19.782C3.73913 19.5903 3.43317 19.2843 3.24142 18.908C3.02344 18.4802 3.02344 17.9201 3.02344 16.8V9.2C3.02344 8.0799 3.02344 7.51984 3.24142 7.09202C3.43317 6.71569 3.73913 6.40973 4.11546 6.21799C4.51385 6.015 5.0269 6.00103 6.00007 6.00007M19.8455 19.8221L14.5619 14.5619M14.5619 14.5619C14.0349 15.4243 13.0847 16 12 16C10.3431 16 9 14.6569 9 13C9 11.9153 9.57566 10.9651 10.4381 10.4381M14.5619 14.5619L10.4381 10.4381M10.4381 10.4381L6.00007 6.00007" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
<path d="M3 10H4C4.93188 10 5.39782 10 5.76537 10.1522C6.25542 10.3552 6.64477 10.7446 6.84776 11.2346C7 11.6022 7 12.0681 7 13C7 13.9319 7 14.3978 6.84776 14.7654C6.64477 15.2554 6.25542 15.6448 5.76537 15.8478C5.39782 16 4.93188 16 4 16H3M19 6V5C19 3.89543 18.1046 3 17 3H15C13.8954 3 13 3.89543 13 5V6M6.2 20H17.8C18.9201 20 19.4802 20 19.908 19.782C20.2843 19.5903 20.5903 19.2843 20.782 18.908C21 18.4802 21 17.9201 21 16.8V9.2C21 8.07989 21 7.51984 20.782 7.09202C20.5903 6.71569 20.2843 6.40973 19.908 6.21799C19.4802 6 18.9201 6 17.8 6H6.2C5.0799 6 4.51984 6 4.09202 6.21799C3.71569 6.40973 3.40973 6.71569 3.21799 7.09202C3 7.51984 3 8.07989 3 9.2V16.8C3 17.9201 3 18.4802 3.21799 18.908C3.40973 19.2843 3.71569 19.5903 4.09202 19.782C4.51984 20 5.07989 20 6.2 20ZM17 13C17 14.6569 15.6569 16 14 16C12.3431 16 11 14.6569 11 13C11 11.3431 12.3431 10 14 10C15.6569 10 17 11.3431 17 13Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
  })

  return videoButton
}

const renderScreenShareButton = (call: Call) => {
  const screenShareButton = document.createElement('button')
  screenShareButton.classList.add('control-button')

  screenShareButton.addEventListener('click', async () => {
    await call.screenShare.toggle()
  })

  call.screenShare.state.status$.subscribe((status) => {
    screenShareButton.innerHTML =
      status === 'enabled'
        ? `<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
<path d="M12 20H16M12 20H8M12 20V16H5C4.44772 16 4 15.5523 4 15V9M3 3L21 21M10 5H19C19.5523 5 20 5.44772 20 6V15" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
<path d="M16 10.5H8M16 10.5L13 13.5M16 10.5L13 7.5M12 20H16M12 20H8M12 20V16M12 16H5C4.44772 16 4 15.5523 4 15V6C4 5.44771 4.44772 5 5 5H19C19.5523 5 20 5.44772 20 6V7M12 16H19C19.5523 16 20 15.5523 20 15V11" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
  })

  return screenShareButton
}

const renderFlipButton = (call: Call) => {
  const flipButton = document.createElement('button')

  flipButton.classList.add('control-button')

  flipButton.addEventListener('click', async () => {
    await call.camera.flip()
  })

  flipButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
<path opacity="0.5" d="M9.77778 21H14.2222C17.3433 21 18.9038 21 20.0248 20.2646C20.51 19.9462 20.9267 19.5371 21.251 19.0607C22 17.9601 22 16.4279 22 13.3636C22 10.2994 22 8.76721 21.251 7.6666C20.9267 7.19014 20.51 6.78104 20.0248 6.46268C19.3044 5.99013 18.4027 5.82123 17.022 5.76086C16.3631 5.76086 15.7959 5.27068 15.6667 4.63636C15.4728 3.68489 14.6219 3 13.6337 3H10.3663C9.37805 3 8.52715 3.68489 8.33333 4.63636C8.20412 5.27068 7.63685 5.76086 6.978 5.76086C5.59733 5.82123 4.69555 5.99013 3.97524 6.46268C3.48995 6.78104 3.07328 7.19014 2.74902 7.6666C2 8.76721 2 10.2994 2 13.3636C2 16.4279 2 17.9601 2.74902 19.0607C3.07328 19.5371 3.48995 19.9462 3.97524 20.2646C5.09624 21 6.65675 21 9.77778 21Z" fill="#1C274C"/>
<path d="M14.5197 8.84961C14.9339 8.84961 15.2697 9.1854 15.2697 9.59961V11.2796C15.2697 11.6342 15.0213 11.9404 14.6743 12.0135L13.1546 12.3335C12.7492 12.4189 12.3515 12.1595 12.2661 11.7542C12.1928 11.4061 12.3737 11.0637 12.6828 10.9198C11.8617 10.6788 10.9379 10.8822 10.2902 11.5299C9.34598 12.4741 9.34598 14.0049 10.2902 14.9491C11.2344 15.8933 12.7652 15.8933 13.7094 14.9491C14.112 14.5465 14.3422 14.0392 14.4019 13.5148C14.4487 13.1033 14.8203 12.8076 15.2319 12.8544C15.6434 12.9012 15.9391 13.2728 15.8923 13.6844C15.7957 14.5337 15.421 15.3588 14.77 16.0098C13.2401 17.5397 10.7595 17.5397 9.22951 16.0098C7.69954 14.4798 7.69954 11.9992 9.22951 10.4692C10.4581 9.24066 12.2996 8.99864 13.7697 9.74316V9.59961C13.7697 9.1854 14.1055 8.84961 14.5197 8.84961Z" fill="#1C274C"/>
</svg>`

  return flipButton
}

export const renderControls = (call: Call) => {
  return {
    audioButton: renderAudioButton(call),
    videoButton: renderVideoButton(call),
    screenShareButton: renderScreenShareButton(call),
    flipButton: renderFlipButton(call),
  }
}
