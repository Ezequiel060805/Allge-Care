import { StyleSheet } from 'react-native';

import { ExternalLink } from './ExternalLink';
import { MonoText } from './StyledText';
import { Text, View } from './Themed';

import Colors from '@/constants/Colors';

export default function EditScreenInfo({ path }: { path: string }) {
  return (
    <View>

      <View>
        <View style={styles.Container}>
          <Text
            style={styles.Text}
            lightColor="rgba(0,0,0,0.8)"
            darkColor="rgba(255,255,255,0.8)">
            Open up the code for this screen:
          </Text>

          <View
            style={[styles.codeHighlightContainer, styles.homeScreenFilename]}
            darkColor="rgba(255,255,255,0.05)"
            lightColor="rgba(0,0,0,0.05)">
            <MonoText>{path}</MonoText>
          </View>

          <Text
            style={styles.Text}
            lightColor="rgba(0,0,0,0.8)"
            darkColor="rgba(255,255,255,0.8)">
            Change any of the text, save the file, and your app will automatically update.
          </Text>
        </View>

        <View style={styles.helpContainer}>
          <ExternalLink
            style={styles.helpLink}
            href="https://docs.expo.io/get-started/create-a-new-app/#opening-the-app-on-your-phonetablet">
            <Text style={styles.helpLinkText} lightColor={Colors.light.tint}>
              Tap here if your app doesn't automatically update after making changes
            </Text>
          </ExternalLink>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  Container: {
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightContainer: {
    borderRadius: 3,
    paddingHorizontal: 4,
  },
  Text: {
    fontSize: 17,
    lineHeight: 24,
  },
  helpContainer: {
    marginTop: 15,
    marginHorizontal: 20,
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
  },
});
