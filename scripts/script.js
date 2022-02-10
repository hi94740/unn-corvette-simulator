let timerActive
let timerCallback = () => {}
let showingTargetLock
let simulationStarted = false

const radarCircles = Array(5)
  .fill()
  .map(() => document.createElement("div"))

radarCircles.forEach((e, i, a) => {
  e.classList.add("radar-circle")
  e.style.transitionDuration = (i + 1) * 0.4 + "s"
  e.style.transitionDelay = "0.5s"
  if (i === 0)
    document.querySelector("#unn-corvette .jamming-range").appendChild(e)
  else a[i - 1].appendChild(e)
})

const popup = document.getElementById("popup")
const annotation = document.getElementsByClassName("annotation")
const hostileCorvette = document.getElementById("hostile-corvette-container")

addEventListener("load", () => {
  document.getElementsByTagName("main")[0].classList.add("show")
  setTimeout(() => {
    popup.classList.remove("show")
    setTimeout(() => {
      popup.classList.remove("loading")
      popup.classList.add("load-complete")
      popup.classList.add("show")
      popup.querySelector("button.ok").addEventListener("click", () => {
        popup.classList.remove("show")
        setTimeout(() => popup.classList.remove("load-complete"), 100)
        radarCircles.forEach((e, i) =>
          e.style.setProperty("--size", ++i * 250 + "px")
        )
        hostileCorvette.classList.add("show")
        setTimeout(() => {
          if (!simulationStarted) {
            annotation[3].classList.add("target-locked")
            annotation[3].classList.add("show")
            showingTargetLock = setTimeout(
              () => annotation[3].classList.remove("show"),
              3000
            )
          }
        }, 2200)

        document
          .getElementById("fire-control-panel")
          .addEventListener("mouseenter", () =>
            document.getElementById("weapons-container").classList.add("show")
          )
      })
    }, 100)
  }, 500)
})

const weaponItems = document.querySelectorAll(".weapon-item")
weaponItems.forEach(weaponItem => {
  const status = weaponItem.querySelector(".weapon-status")
  const desc = weaponItem.querySelector(".weapon-description")
  const img = weaponItem.querySelector(".weapon-image-container")
  img.addEventListener("mouseenter", () => {
    status.style.height = "0px"
    desc.style.height = "78px"
  })
  img.addEventListener("mouseleave", () => {
    desc.style.height = "0px"
    status.style.height = "78px"
  })

  weaponItem.querySelector("button").addEventListener("click", () => {
    console.log(weaponItem.id)

    weaponItems.forEach(wi => {
      wi.querySelector("button").disabled = true
      wi.classList.remove("standby")
      if (wi !== weaponItem) wi.classList.add("unavailable")
    })

    const timer = document.querySelector("#timer")
    let countDown = 1000
    timerActive = setInterval(() => {
      timer.style.setProperty(
        "--caption",
        '"' + (--countDown / 100).toFixed(2) + '"'
      )
      timer.style.setProperty("--progress", countDown / 10 + "%")
      if (countDown === 0) {
        clearInterval(timerActive)
        timerCallback()
      }
    }, 10)

    simulationStarted = true
    if (showingTargetLock) {
      clearInterval(showingTargetLock)
      setTimeout(() => annotation[3].classList.remove("target-locked"), 500)
      annotation[3].classList.remove("show")
    }

    const weaponsIds = ["railgun", "missile", "jammer"]
    const playerWeapon = weaponsIds.indexOf(weaponItem.id)
    // const botWeapon = 2
    const botWeapon = Math.floor(Math.random() * 3)
    console.log({playerWeapon, botWeapon})
    const pb = playerWeapon - botWeapon
    const win = pb === 1 || pb === -2
    const lose = pb === -1 || pb === 2
    const tie = pb === 0
    console.log({win, lose, tie})

    if (tie) {
      popup.classList.add("tie")
      timerCallback = () => popup.classList.add("show")
    }
    if (win) popup.classList.add("win")
    if (lose) popup.classList.add("lose")

    const battery = document.querySelector("#battery-container")
    const remainingBattery = document.querySelector("#remaining-battery")
    const debris = document.querySelector("#radar-space-4 .radar-circle")
    const enemyJammer = document.querySelector(
      "#hostile-corvette .jamming-range"
    )

    const terminate = () => {
      clearTimeout(timerActive)
      popup.classList.add("show")
    }
    const destroyEnemyShip = () => {
      hostileCorvette.classList.remove("show")
      setTimeout(() => {
        annotation[3].classList.remove("jamming-signal")
        annotation[3].classList.remove("railgun-charging")
        hostileCorvette.classList.add("show-debris")
        annotation[3].classList.add("debris-field")
        annotation[3].classList.add("warning")
        annotation[3].classList.add("show")
        setTimeout(terminate, 500)
      }, 500)
    }

    battery.style.setProperty("--color", "var(--yellow)")
    weaponItem.style.setProperty("--font-weight", "700")

    if (weaponsIds[playerWeapon] === "railgun") {
      weaponItem.style.setProperty("--caption", '"CHARGING"')
      if (win || tie) {
        weaponItem.style.setProperty("--progress", "100%")
        weaponItem.style.setProperty("--progress-time", "8s linear")
        setTimeout(() => {
          weaponItem.style.setProperty("--caption", '"FIRED"')
          weaponItem.classList.add("blink3")
          battery.style.setProperty("--color", "var(--red)")
          remainingBattery.style.width = "0%"
          annotation[3].classList.remove("show")
          if (tie) {
            setTimeout(() => {
              remainingBattery.style.width = "20%"
              remainingBattery.style.setProperty("--progress-time", "2s")
            }, 1000)
            debris.style.transitionDuration = "3.5s"
            debris.style.setProperty("--size", "50px")
            debris.style.visibility = "visible"
            annotation[1].classList.add("show")
          }
          if (win) {
            enemyJammer.classList.remove("activated")
            destroyEnemyShip()
          }
        }, 8000)
      } else {
        weaponItem.style.setProperty("--progress", "50%")
        weaponItem.style.setProperty("--progress-time", "4s linear")
      }
    }
    if (weaponsIds[playerWeapon] === "missile") {
      weaponItem.style.setProperty("--caption", '"LAUNCHING"')
      weaponItem.style.setProperty("--progress", "100%")
      weaponItem.style.setProperty("--progress-time", "1s linear")
      remainingBattery.style.width = "0%"
      remainingBattery.style.setProperty("--progress-time", "1s")
      setTimeout(() => {
        annotation[0].classList.add("show")
        annotation[0].classList.add("missile-link-ok")
        weaponItem.style.setProperty("--caption", '"LAUNCHED"')
        weaponItem.classList.add("blink3")
        battery.style.setProperty("--color", "var(--red)")
        if (!win) {
          setTimeout(() => {
            weaponItem.style = ""
            weaponItem.classList.add("unavailable")
          }, 4500)
        }
        setTimeout(() => {
          if (tie) {
            remainingBattery.style.width = "75%"
            remainingBattery.style.setProperty("--progress-time", "9.5s")
          }
          if (lose) {
            remainingBattery.style.width = "40%"
            remainingBattery.style.setProperty("--progress-time", "5.3s")
          }
          if (win) {
            remainingBattery.style.width = "30%"
            remainingBattery.style.setProperty("--progress-time", "3s")
          }
        }, 1000)
        if (tie) {
          annotation[0].style.transitionDuration = "2s"
          annotation[0].style.transform = "translateX(195px)"
          annotation[2].style.transitionDuration = "2s"
          annotation[2].style.transform = "translateX(-195px)"
          setTimeout(() => {
            annotation[0].classList.remove("show")
            annotation[2].classList.remove("show")
            debris.style.transitionDuration = "10s"
            debris.style.setProperty("--size", "250px")
            debris.style.visibility = "visible"
            annotation[1].classList.add("show")
          }, 2000)
        }
        if (lose) {
          annotation[0].style.transitionDuration = "2s"
          annotation[0].style.transform = "translateX(250px)"
          setTimeout(() => {
            annotation[0].style.transitionTimingFunction = "ease-out"
            annotation[0].style.transitionDuration = "1.2s"
            annotation[0].style.transform = "translateX(350px)"
            annotation[0].classList.remove("missile-link-ok")
            annotation[0].classList.add("missile-link-err")
            annotation[0].classList.add("warning")
            setTimeout(() => {
              annotation[0].style.transitionTimingFunction = "ease-in"
              annotation[0].style.transitionDuration = "2.5s"
              annotation[0].style.transform = "translateX(0px)"
              setTimeout(terminate, 2500)
            }, 2000)
          }, 1800)
        }
        if (win) {
          annotation[0].style.transitionDuration = "3s"
          annotation[0].style.transform = "translateX(400px)"
          setTimeout(() => {
            annotation[0].classList.remove("show")
            destroyEnemyShip()
          }, 3000)
        }
      }, 1000)
    }
    if (weaponsIds[playerWeapon] === "jammer") {
      weaponItem.style.setProperty("--caption", '"DEPLOYING"')
      weaponItem.style.setProperty("--progress", "100%")
      weaponItem.style.setProperty("--progress-time", "1s linear")
      const jammer = document.querySelector("#unn-corvette .jamming-range")
      setTimeout(() => {
        jammer.classList.add("activated")
        setTimeout(() => {
          weaponItem.style.setProperty("--caption", '"ACTIVE"')
          if (tie) {
            weaponItem.style.setProperty("--progress", "5%")
            weaponItem.style.setProperty("--progress-time", "10s linear")
            remainingBattery.style.width = "5%"
            remainingBattery.style.setProperty("--progress-time", "10s")
          }
          if (win) {
            weaponItem.style.setProperty("--progress", "38%")
            weaponItem.style.setProperty("--progress-time", "6.5s linear")
            remainingBattery.style.width = "38%"
            remainingBattery.style.setProperty("--progress-time", "6.5s")
          }
          if (lose) {
            weaponItem.style.setProperty("--progress", "23%")
            weaponItem.style.setProperty("--progress-time", "8s linear")
            remainingBattery.style.width = "23%"
            remainingBattery.style.setProperty("--progress-time", "8s")
            setTimeout(() => {
              annotation[3].classList.remove("show")
              terminate()
            }, 8000)
          }
        }, 300)
      }, 700)
    }

    if (weaponsIds[botWeapon] === "railgun") {
      annotation[3].classList.add("warning")
      annotation[3].classList.add("railgun-charging")
      annotation[3].classList.add("show")
    }
    if (weaponsIds[botWeapon] === "missile") {
      setTimeout(() => {
        annotation[2].classList.add("show")
        if (lose) {
          annotation[2].style.transitionDuration = "3s"
          annotation[2].style.transform = "translateX(-400px)"
          setTimeout(terminate, 3000)
        }
        if (win) {
          annotation[2].style.transitionDuration = "2s"
          annotation[2].style.transform = "translateX(-250px)"
          setTimeout(() => {
            annotation[2].style.transitionTimingFunction = "ease-out"
            annotation[2].style.transitionDuration = "1.2s"
            annotation[2].style.transform = "translateX(-350px)"
            annotation[2].classList.remove("warning")
            annotation[2].classList.remove("incoming-missile")
            annotation[2].classList.add("missile-link-ok")
            setTimeout(() => {
              annotation[2].style.transitionTimingFunction = "ease-in"
              annotation[2].style.transitionDuration = "2.5s"
              annotation[2].style.transform = "translateX(0px)"
              setTimeout(() => {
                annotation[2].classList.remove("show")
                destroyEnemyShip()
              }, 2500)
            }, 2000)
          }, 1800)
        }
      }, 1000)
    }
    if (weaponsIds[botWeapon] === "jammer") {
      setTimeout(() => {
        enemyJammer.classList.add("activated")
        annotation[3].classList.add("warning")
        annotation[3].classList.add("jamming-signal")
        annotation[3].classList.add("show")
      }, 700)
    }
  })
})

document
  .querySelector("button.reload")
  .addEventListener("click", () => location.reload())
