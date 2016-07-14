import {
    SourceLayer
}
from './source/sourceLayer';
import {
    Context
}
from './context';
import {
    DragPan
}
from './interaction/dragPan';
import {
    DoubleClickZoom
}
from './interaction/doubleClickZoom';
import {
    MouseWheelZoom
}
from './interaction/mouseWheelZoom';
import {
    Camera
}
from './camera';
import {
    Observable
} from './util/observable';
import {
    DomEvent
} from './util/domEvent';

const EARTH_RADIUS = 6378137;

class Earth extends Observable{
    constructor(containerId) {
        super();
        this._zoomDist = [];
        for (let level = 0; level < 18; level++) {
            this._zoomDist.push(EARTH_RADIUS * Math.pow(1.05, 18 - level));
        }

        this._container = document.getElementById(containerId);
        this._context = new Context(this._container);
        this._camera = new Camera();
        this._zoom = 3;
        this._camera.eye = [0, 0, this._zoomDist[this._zoom - 1]];

        this._sourceLayers = [];
        this._interactions=[];

        //new DragPan(this);
        //new DoubleClickZoom(this);
        //new MouseWheelZoom(this);
        DomEvent.on(this._context.canvas,[ 'click','dblclick','mousedown','mouseup' ,
            'mouseover','mouseout','mousemove','mousewheel','keypress'], this._handleDOMEvent, this);
    }

    get context() {
        return this._context;
    }

    rotateX(radian) {
        this.rotate(radian);
    }

    rotateY(radian) {
        this.rotate(undefined, radian);
    }

    rotate(xRadian, yRadian) {
        if (xRadian) {
            this._camera.rotateX = this._camera.rotateX + xRadian;
        }

        if (yRadian) {
            this._camera.rotateY = this._camera.rotateY + yRadian;
        }
        this.render();
    }

    get zoom() {
        return this._zoom;
    }

    setZoom(level) {
        level = level > 18 ? 18 : level < 1 ? 1 : level;
        if (level !== this._zoom) {
            this._zoom = level;
            this._camera.eye = [0, 0, this._zoomDist[level - 1]];
            this.render();
        }
    }

    addLayer(layer) {
        let sourceLayer = SourceLayer.from(this._context, layer);
        this._sourceLayers.push(sourceLayer);
        this.render();
    }

    render() {
        this._sourceLayers.forEach(function (layer) {
            layer.render(this._camera);
        }.bind(this));
    }
    _handleDOMEvent (e) {
        let type = e.type === 'keypress' && e.keyCode === 13 ? 'click' : e.type;
        type =type==='wheel'?'mousewheel':type;
        if (e._stopped) { return; }
        var data = {
            originalEvent: e
        };
        this.trigger(type,data);
    }
    addInteraction(interaction){
        interaction.setEarth(this);
        interaction.enable();
        this._interactions.push(interaction);
        return this;
    }
    removeInteraction(interaction){
        for(let i=0,len=this._interactions.length;i<len;i++){
            if(this._interactions[i]===interaction){
                interaction.disable();
                interaction.setEarth(null);
                this._interactions.splice(i,1);
                break;
            }
        }
        return this;
    }
}

export {
    Earth
};