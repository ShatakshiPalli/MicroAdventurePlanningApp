import React, { useEffect, useMemo, useRef } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';

// Props: milestones (array), currentMilestoneId (string)
// Each milestone: { id, name, order, completed, coordinates: { latitude, longitude } }
export function RouteMap({ milestones = [], currentMilestoneId }) {
  const webRef = useRef(null);

  // Send milestone updates whenever list or current changes
  useEffect(() => {
    const progressIndex = milestones
      .sort((a, b) => a.order - b.order)
      .findIndex(m => !m.completed);
    const msg = {
      type: 'update',
      payload: {
        milestones: milestones
          .sort((a, b) => a.order - b.order)
          .map((m) => ({
            id: m.id,
            name: m.name,
            order: m.order,
            completed: m.completed,
            lat: m.coordinates.latitude,
            lng: m.coordinates.longitude,
          })),
        currentId: currentMilestoneId,
        progressIndex,
      },
    };
    webRef.current?.postMessage(JSON.stringify(msg));
  }, [milestones, currentMilestoneId]);

  const html = useMemo(() => buildHtml(), []);

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowUniversalAccessFromFileURLs
        onMessage={() => {}}
        automaticallyAdjustContentInsets={false}
        setSupportMultipleWindows={false}
        style={{ flex: 1 }}
      />
    </View>
  );
}

function buildHtml() {
  return `<!DOCTYPE html><html><head>
  <meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
  <link href="https://unpkg.com/maplibre-gl@3.3.1/dist/maplibre-gl.css" rel="stylesheet"/>
  <style>
  html,body,#map{margin:0;height:100%;width:100%}
  .marker-label{background:#222;color:#fff;font-size:11px;padding:2px 6px;border-radius:14px;border:1px solid #fff3;font-family:system-ui}
  .marker-label.current{background:#0a7ea4}
  .marker-label.completed{background:#2e8b57}
  </style></head><body><div id="map"></div>
  <script src="https://unpkg.com/maplibre-gl@3.3.1/dist/maplibre-gl.js"></script>
  <script>
  const map=new maplibregl.Map({container:'map',style:'https://demotiles.maplibre.org/style.json',center:[0,0],zoom:2});
  map.addControl(new maplibregl.NavigationControl(),'top-right');
  let milestoneMarkers=[];const L_DONE='route-done';const L_TODO='route-todo';
  function clearRoute(){
    milestoneMarkers.forEach(m=>m.remove()); milestoneMarkers=[];
    [L_DONE,L_TODO].forEach(id=>{
      if(map.getLayer(id)) map.removeLayer(id);
      if(map.getSource(id)) map.removeSource(id);
    });
  }
  function drawLines(coords, progressIndex){
    if(!coords.length) return;
    const doneCoords = progressIndex<=0?[]:coords.slice(0,progressIndex+1);
    const todoCoords = progressIndex<0?coords:coords.slice(Math.max(progressIndex,0));
    if(doneCoords.length>1){
      map.addSource(L_DONE,{type:'geojson',data:{type:'Feature',geometry:{type:'LineString',coordinates:doneCoords}}});
      map.addLayer({id:L_DONE,type:'line',source:L_DONE,paint:{'line-color':'#2e8b57','line-width':5,'line-opacity':0.9}});
    }
    if(todoCoords.length>1){
      map.addSource(L_TODO,{type:'geojson',data:{type:'Feature',geometry:{type:'LineString',coordinates:todoCoords}}});
      map.addLayer({id:L_TODO,type:'line',source:L_TODO,paint:{'line-color':'#0a7ea4','line-width':4,'line-dasharray':[2,2],'line-opacity':0.9}});
    }
  }
  function fit(points){
    if(!points.length) return;
    if(points.length===1){map.easeTo({center:points[0],zoom:14});return;}
    const b=new maplibregl.LngLatBounds(points[0],points[0]);
    points.forEach(p=>b.extend(p));
    map.fitBounds(b,{padding:40,maxZoom:15,duration:600});
  }
  function render(data){
    clearRoute();
    const coords=[];
    data.milestones.forEach(ms=>{
      const el=document.createElement('div');
      el.className='marker-label';
      if(ms.id===data.currentId) el.classList.add('current');
      if(ms.completed) el.classList.add('completed');
      el.textContent=(ms.order+1)+'. '+ms.name;
      const marker=new maplibregl.Marker({element:el}).setLngLat([ms.lng,ms.lat]).addTo(map);
      milestoneMarkers.push(marker);
      coords.push([ms.lng,ms.lat]);
    });
    drawLines(coords,data.progressIndex);
    if(coords.length) fit(coords);
  }
  function handleMessage(ev){
    try{
      const msg=JSON.parse(ev.data||ev);
      if(msg.type==='update') render(msg.payload);
    }catch(e){}
  }
  document.addEventListener('message',handleMessage);window.addEventListener('message',handleMessage);
  </script></body></html>`;
}