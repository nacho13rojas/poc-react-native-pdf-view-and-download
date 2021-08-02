import React, {useState} from 'react';
import {
  Button,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  PermissionsAndroid,
  View,
  ActivityIndicator,
} from 'react-native';

import {Header} from 'react-native/Libraries/NewAppScreen';

import RNFS from 'react-native-fs';

import PDFView from 'react-native-view-pdf';

const App = () => {
  const [pathOnDevice, setPathOnDevice] = useState(null);
  const [showWebView, setShowWebView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [base64, setBase64] = useState(null);
  const [renderedOnce, setRenderedOnce] = useState(false);

  const pathDir =
    Platform.OS === 'android'
      ? RNFS.CachesDirectoryPath
      : RNFS.LibraryDirectoryPath;

  const readDir = () => {
    console.log('======================= readDir =========================');
    console.log(Platform.OS);
    RNFS.readDir(pathDir)
      .then(result => {
        console.log('GOT RESULT', Platform.OS, result);

        return Promise.all([RNFS.stat(result[0].path), result[0].path]);
      })
      .then(statResult => {
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

  const downloadPDF = async (url, fileName) => {
    setLoading(true);
    console.log(
      '====================== downloadPDF ==========================',
    );
    console.log(Platform.OS);
    const path = `${pathDir}/${fileName}.pdf`;
    console.log('PATH', path);

    const headers = {
      Accept: 'application/pdf',
      'Content-Type': 'application/pdf',
      Authorization: 'Bearer [token]',
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
        console.log('res.path', res.path);
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

  const requestReadExternalStoragePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Cool Photo App Camera Permission',
          message:
            'Cool Photo App needs access to your camera ' +
            'so you can take awesome pictures.',
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

  const updateSource = async () => {
    console.log('====================== updateSource ======================');
    console.log('showWebView', showWebView);
    console.log('renderedOnce', renderedOnce);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRenderedOnce(true);
  };

  if (showWebView) {
    console.log(
      `====================== showWebView ${Platform.OS} ======================`,
    );
    console.log('showWebView', showWebView);
    console.log('renderedOnce', renderedOnce);
    console.log('base64', base64);
    console.log('pathOnDevice', pathOnDevice);

    // const resourceType = 'file';
    const resourceType = 'url';

    return (
      <View style={{flex: 1}}>
        <PDFView
          fadeInDuration={250.0}
          style={{
            display: 'flex',
            flex: 1,
            backgroundColor: loading ? '#FF0000' : '#00FF00',
          }}
          resource={
            // pathOnDevice
            'https://storage.googleapis.com/medical-reports-hml/4091623%2Fcdb%2F3-415542%2Freport.pdf?GoogleAccessId=ms-reports%40nav-hml.iam.gserviceaccount.com&Expires=1629557090&Signature=tWsXxRCLdmpR91GiicjCh78tZ3Vq2gKQBsfBBstSeyoUfNQ8GaiwXOFuP0vrnLS8aMGm%2F42us84UzfNo5yi%2F%2BOgolhjO%2FACyF6QM1nh9VD7LEHOaYOAd81H%2BKiioC9TjWlVLBMMpIxh6rEF312tdYTSPD6Ls110wjoGVHYQpFLAS2n%2Bkg%2B3B%2B83TO3E61IDcDan4FqjGSXr3vvCtJYsD%2FATio1gTl2fAngrIIKzu1QxsYAKKfZRyGUI5kmspoz8T7xCn%2BQRm6z2fxDC6m8uXndl0xP0iX749quRm5vyLtui9KvlaTWpLVAi%2FjsrwpMQWhWVjqsafIvE3DLh%2Fan9HAA%3D%3D'
          }
          resourceType={resourceType}
          onLoad={() => {
            setLoading(false);
            console.log(`PDF rendered from ${resourceType}`);
          }}
          onError={error => console.log('Cannot render PDF', error)}
        />
        {loading && (
          <View
            style={{
              position: 'absolute',
              height: '100%',
              width: '100%',
              backgroundColor: '#0000FF',
            }}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView>
      <StatusBar />
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <Header />
        <View>
          <Button
            title="request permissions"
            onPress={requestReadExternalStoragePermission}
          />
          <Button title="read dir" onPress={readDir} />
          <Button
            title="download PDF"
            onPress={() =>
              downloadPDF(
                'https://www.eurofound.europa.eu/sites/default/files/ef_publication/field_ef_document/ef1710en.pdf',
                'sample',
              )
            }
          />
          <Button
            title="Show WebView"
            onPress={() => {
              setShowWebView(true);
              setLoading(true);
            }}
          />
          {loading && <ActivityIndicator size="large" color="#0000ff" />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
