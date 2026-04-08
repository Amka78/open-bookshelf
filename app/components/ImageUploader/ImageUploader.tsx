import { Image, type ImageProps } from "@/components"
import { Pressable } from "@gluestack-ui/themed"
import * as ImagePicker from "expo-image-picker"
import type { Ref } from "react"
import { type ImageStyle, type StyleProp, StyleSheet } from "react-native"
export type ImageUploaderProps = ImageProps & {
  onImageUpload: (url: string) => void
  ref?: Ref<React.ElementRef<typeof Pressable>>
}

export const ImageUploader = ({ ref, ...props }: ImageUploaderProps) => {
  const onImageSize = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    })

    if (!result.canceled) {
      if (props.onImageUpload) {
        props.onImageUpload(result.assets[0].uri)
      }
    }
  }
  return (
    <Pressable onPress={onImageSize} ref={ref}>
      <Image {...props} style={styles.imageSize as StyleProp<ImageStyle>} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  imageSize: {
    height: 320,
    width: 240,
  },
})
