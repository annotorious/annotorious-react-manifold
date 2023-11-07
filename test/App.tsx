import React, { useEffect } from 'react';
import { OpenSeadragonAnnotator, OpenSeadragonViewer } from '@annotorious/react';
import { Annotorious, useAnnotoriousManifold } from '../src';

const ViewerTile = (props: { url: string }) => {

  return (
    <div className="viewer-tile">
      <Annotorious source={props.url}>
        <OpenSeadragonAnnotator>
          <OpenSeadragonViewer
            className="osd-container"
            options={{
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
            }} />
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

