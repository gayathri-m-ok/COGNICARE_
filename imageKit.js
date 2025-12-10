import React from 'react';
import { IKContext, IKUpload } from 'imagekitio-react';


const MemoryReframing = () => {
  return (
    <IKContext
      publicKey="public_W2erg6dkBxcq3RumUXVL8jW0BJc="
      urlEndpoint="https://ik.imagekit.io/cognicareimg"
      authenticationEndpoint="http://www.yourserver.com/auth" // Optional; can be removed if not needed
    >
      <div className="therapy-screen">
        <h1>Memory Reframing</h1>
        <p>This section helps users paint and replace negative memories with positive associations.</p>

        <IKUpload
          fileName="memory_reframing_upload.jpg"
          onSuccess={(res) => console.log('Upload Success', res)}
          onError={(err) => console.log('Upload Error', err)}
        />
      </div>
    </IKContext>
  );
};

export default MemoryReframing;
