import { ReactNode, useContext, useEffect } from 'react';
import { Annotation, Annotator, useAnnotator } from '@annotorious/react';
import { Annotorious as AnnotoriousInstance } from '@annotorious/react';
import { AnnotoriousManifoldContext } from './AnnotoriousManifold';

interface AnnotoriousProps {

  children: ReactNode;

  source: string;

}

/**
 * Consumes the standard Annotorious context, and passes the Annotator
 * upwards to the manifold.
 */
const AnnotoriousInstanceShim = <I extends Annotation = Annotation, E extends unknown = Annotation>(props: AnnotoriousProps) => {

  const anno = useAnnotator<Annotator<I, E>>();

  const { connectAnnotator } = useContext(AnnotoriousManifoldContext);

  useEffect(() => {
    if (anno)
      return connectAnnotator(props.source, anno);
  }, [anno]);

  return <>{props.children}</>;

}

/**
 * An alternative <Annotorious /> component that mimicks the original
 * from @annotorious/react, but injects the shim component, which connects
 * the Annotator to the Manifold.
 */
export const Annotorious = (props: AnnotoriousProps) => {

  return (
    <AnnotoriousInstance>
      <AnnotoriousInstanceShim source={props.source}>
        {props.children}
      </AnnotoriousInstanceShim>
    </AnnotoriousInstance>
  )

}