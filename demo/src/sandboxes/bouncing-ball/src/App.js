import React, { useRef } from "react";
import {
  animated,
  Controller
} from "@react-spring/web";
import "./styles.css";
import "bootstrap/dist/css/bootstrap.css";

export default function App() {
  let rimba = new Controller({
    x: 0,
    y: 0,
    config: {
      mass: 2,
      tension: 20,
      friction: 15,
      bounce: 1.5
    },
    onChange: (x) => {
      if (x.value.y < 275 && mossa.current <= 100) {
        mossa.current += 1;

        rimba.start({
          x: mossa.current * 2,
          config: {
            mass: 1,
            tension: 170,
            friction: 26,
            bounce: 0
          }
        });
      }
    }
  });

  let mossa = useRef(0);

  function starto() {
    let tenso = Math.round(350 - Math.random() * 100);
    let fricto = Math.round(35 - Math.random() * 20);

    rimba.set({ x: 0, y: 0 });
    mossa.current = 0;

    rimba.start({
      y: 300,
      config: {
        tension: tenso,
        friction: fricto
      }
    });
  }

  return (
    <div>
      <div className="d-flex justify-content-center mt-5 mb-2 ms-5">
        <div className="d-block">
          <animated.div
            className="round ms-1"
            style={rimba.springs}
          ></animated.div>

          <div className="text-center" style={{ marginTop: 330 }}>
            <button className="btn btn-primary" onClick={starto}>
              start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
