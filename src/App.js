import React, {useState} from 'react';
import {
  Button,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  View,
  ActivityIndicator,
} from 'react-native';

import {Header} from 'react-native/Libraries/NewAppScreen';
import RNFS from 'react-native-fs';
import PDFView from 'react-native-view-pdf';

import {
  downloadPDF,
  readDir,
  requestReadExternalStoragePermission,
  sharePdf,
} from './utils';
import {base64asset, pdfUrl} from './assets';

const App = () => {
  const [pathOnDevice, setPathOnDevice] = useState(null);
  const [showPdf, setShowPdf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [base64, setBase64] = useState(null);

  const pathDir =
    Platform.OS === 'android'
      ? RNFS.CachesDirectoryPath
      : RNFS.LibraryDirectoryPath;

  if (showPdf) {
    console.log(
      `====================== showPdf ${Platform.OS} ======================`,
    );
    console.log('base64', base64);
    console.log('pathOnDevice', pathOnDevice);

    const resourceType = 'file';
    // const resourceType = 'url';

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
            pathOnDevice
            // pdfUrl
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
          {Platform.OS === 'android' && (
            <Button
              title="Request permissions"
              onPress={requestReadExternalStoragePermission}
            />
          )}
          <Button
            title="Download PDF"
            onPress={() =>
              downloadPDF(
                pdfUrl,
                'sample',
                pathDir,
                setLoading,
                setPathOnDevice,
              )
            }
          />
          <Button
            title="Read dir and save base64"
            onPress={() => readDir(pathDir, setBase64)}
          />
          <Button
            title="Show PDF"
            onPress={() => {
              setShowPdf(true);
              setLoading(true);
            }}
          />
          <Button
            title="Share PDF from base64"
            onPress={() => sharePdf(base64, pathOnDevice)}
          />
          {loading && <ActivityIndicator size="large" color="#0000ff" />}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
