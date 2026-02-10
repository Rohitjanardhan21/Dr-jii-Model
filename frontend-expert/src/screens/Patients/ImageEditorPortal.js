import ReactDOM from 'react-dom';
import ImageEditor from './ImageEditor';

const ImageEditorPortal = (props) => {
  return ReactDOM.createPortal(
    <ImageEditor {...props} />,
    document.body
  );
};

export default ImageEditorPortal;
