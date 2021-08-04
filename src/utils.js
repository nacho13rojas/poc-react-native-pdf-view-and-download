import {PermissionsAndroid, Platform} from 'react-native';

import RNFS from 'react-native-fs';
import Share from 'react-native-share';

export const readDir = (pathDir, setBase64) => {
  console.log('======================= readDir =========================');
  console.log(Platform.OS);
  RNFS.readDir(pathDir)
    .then(result => {
      console.log('GOT RESULT', Platform.OS, result);
      const file = result.find(element => element.name === 'sample.pdf');
      console.log('file', file);

      return Promise.all([RNFS.stat(file.path), file.path]);
    })
    .then(statResult => {
      console.log('statResult', statResult);
      if (statResult[0].isFile()) {
        return RNFS.readFile(statResult[1], 'base64');
      }

      return 'no file';
    })
    .then(contents => {
      console.log('CONTENTS', Platform.OS, contents);
      setBase64(contents);
    })
    .catch(error => {
      console.log('ERROR CONTENTS', Platform.OS, error);
    });
};

export const downloadPDF = async (
  url,
  fileName,
  pathDir,
  setLoading,
  setPathOnDevice,
) => {
  setLoading(true);
  console.log('====================== downloadPDF ==========================');
  console.log(Platform.OS);
  const path = `${pathDir}/${fileName}.pdf`;
  console.log('PATH', path);

  const headers = {
    Accept: 'application/pdf',
    'Content-Type': 'application/pdf',
    Authorization: 'Bearer [token]',
    // Authorization: 'OAUTH2_TOKEN',
    // Authorization: 'AKIAQBHT2D72PUOHBEHO',
    // Signature: '9Ht2BRq95nFbWncW1vmHepE9h2g',
  };

  const options = {
    fromUrl: url,
    toFile: path,
    headers: headers,
  };

  const response = await RNFS.downloadFile(options);
  console.log('RESPONSE', response);
  response.promise
    .then(async res => {
      console.log('res', res);
      console.log('res.statusCode', res.statusCode);
      console.log('res.bytesWritten', res.bytesWritten);
      if (res && res.statusCode === 200 && res.bytesWritten > 0) {
        console.log('SUCCESS', res);
        setPathOnDevice(path);
      } else {
        console.log('ERROR', res);
      }
      setLoading(false);
    })
    .catch(error => {
      console.log('ERROR ON RESPONSE', Platform.OS, error);
      setLoading(false);
    });
};

export const requestReadExternalStoragePermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: 'External Storage Permission',
        message: 'This app needs access to your storage',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('requestReadExternalStorage permission GRANTED');
    } else {
      console.log('requestReadExternalStorage permission denied');
    }
  } catch (err) {
    console.warn(err);
  }
};

export const sharePdf = (base64, pathOnDevice) => {
  console.log(
    `====================== sharePdf ${Platform.OS} ======================`,
  );
  console.log('base64', base64);
  console.log('pathOnDevice', pathOnDevice);
  //   const url = Platform.OS === 'android' ? `data:application/pdf;base64,${base64}` : `file://${pathOnDevice}`
  //   const url = `file://${pathOnDevice}`
  const url = `data:application/pdf;base64,${base64}`;
  Share.open({
    url,
    filename: 'resultado',
    type: 'pdf',
    title: 'My Application',
    message: 'resultado.pdf',
    subject: 'My Application',
  });
};
