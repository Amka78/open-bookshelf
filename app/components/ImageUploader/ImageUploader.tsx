import { Image, ImageProps } from "@/components"
import { StyleSheet, StyleProp, ImageStyle } from "react-native"
import * as ImagePicker from 'expo-image-picker'
import { Pressable } from "@gluestack-ui/themed"
export type ImageUploaderProps = ImageProps & {
  onImageUpload: (url: string) => void
}

export function ImageUploader(props: ImageUploaderProps) {

  const onImageSize = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (props.onImageUpload) {
        props.onImageUpload(result.assets[0].uri)
      }
    }
  };
  return <Pressable onPress={onImageSize}>
    <Image {...props} style={styles.imageSize as StyleProp<ImageStyle>} />
  </Pressable>
}

const styles = StyleSheet.create({
  imageSize: {
    height: 320,
    width: 240,
  },
})