import React, {useState} from 'react';
import logo from './logo.svg';
import {BezierCurvesEditor} from "./components/bezier/BezierCurvesEditor";
import {PiecewiseBezier} from "./particle/functions/PiecewiseBezier";
import {Application} from "./components/Application";
import 'semantic-ui-css/semantic.min.css';
import {ThreejsViewport} from "./components/ThreejsViewport";
import {Bezier} from "./particle/functions/Bezier";

const App: React.FC = () => {

  const [bezierCurves, setBezierCurves] = useState(
      new PiecewiseBezier([
        [new Bezier(0, 0.5 / 3, 0.5 / 3 * 2, 0.5), 0],
        [new Bezier(0.5, 0.5, 0.5, 0.5), 0.5],
      ])
  );

  return (<Application />
  );
    /*<div className="App">
        <header className="App-header">
            <BezierCurvesEditor width={200} height={100} value={bezierCurves} onChange={(bezierCurves) => {setBezierCurves(bezierCurves)}}/>
        </header>
    </div>*/
}

export default App;
