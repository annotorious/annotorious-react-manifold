import React, { useEffect, useMemo } from 'react';
import { OpenSeadragonAnnotator, OpenSeadragonViewer } from '@annotorious/react';
import { Annotorious, useAnnotoriousManifold } from '../src';

const ViewerTile = (props: { url: string }) => {

  const options = useMemo(() => ({
    prefixUrl: 'https://cdn.jsdelivr.net/npm/openseadragon@3.1/build/openseadragon/images/', 
    tileSources: {
      type: 'image',
      url: props.url
    },
    gestureSettingsMouse: {
      clickToZoom: false
    },
    showRotationControl: true,
    crossOriginPolicy: 'Anonymous'
  }), []);

  return (
    <div className="viewer-tile">
      <Annotorious id={props.url}>
        <OpenSeadragonAnnotator>
          <OpenSeadragonViewer
            className="osd-container"
            options={options} />
        </OpenSeadragonAnnotator>
      </Annotorious>
    </div>
  )

}

export const App = () => {

  const manifold = useAnnotoriousManifold();

  useEffect(() => {
    console.log('annotators', manifold.annotators);
  }, [manifold.annotators]);

  return (
    <div className="container">
      <ViewerTile url="33054-000002-0001.jpg" />
      <ViewerTile url="33054-000002-0001.jpg" />
      <ViewerTile url="33054-000002-0001.jpg" />
      <ViewerTile url="33054-000002-0001.jpg" />
    </div>
  )

}

