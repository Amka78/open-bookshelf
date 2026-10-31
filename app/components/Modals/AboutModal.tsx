import { Button, Heading } from "@/components"
import { AboutContent } from "@/components/About/AboutContent"
import { getAppVersion } from "@/utils/appVersion"
import { ScrollView } from "@gluestack-ui/themed"
import type { ModalComponentProp } from "react-native-modalfy"
import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Footer } from "./ModalFooter"
import { Root } from "./Root"
import type { ModalStackParams } from "./Types"

export type AboutModalProps = ModalComponentProp<ModalStackParams, void, "AboutModal">

export function AboutModal(props: AboutModalProps) {
  return (
    <Root>
      <Header>
        <Heading tx="about.title" isTruncated={true} />
        <CloseButton onPress={() => props.modal.closeModal()} />
      </Header>
      <Body>
        <ScrollView>
          <AboutContent version={getAppVersion()} />
        </ScrollView>
      </Body>
      <Footer>
        <Button tx="common.ok" onPress={() => props.modal.closeModal()} />
      </Footer>
    </Root>
  )
}
