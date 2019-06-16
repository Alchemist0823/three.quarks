import React, {useState} from 'react';
import logo from './logo.svg';
import {BezierCurvesEditor} from "./components/bezier/BezierCurvesEditor";
import {Bezier, BezierCurvesValue} from "./particle/BezierCurvesValue";
import {Application} from "./components/Application";
import 'semantic-ui-css/semantic.min.css';
import {ThreejsViewport} from "./components/ThreejsViewport";

const App: React.FC = () => {

  const [bezierCurves, setBezierCurves] = useState(
      new BezierCurvesValue([
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
