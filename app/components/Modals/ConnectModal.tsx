import { ConnectContent, Heading } from "@/components"
import { useConnect } from "@/hooks"
import { observer } from "mobx-react-lite"
import type { ModalComponentProp } from "react-native-modalfy"
import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Root } from "./Root"
import type { ModalStackParams } from "./Types"

export type ConnectModalProps = ModalComponentProp<ModalStackParams, void, "ConnectModal">

export const ConnectModal = observer((props: ConnectModalProps) => {
  const { form, baseUrl, onConnectPress } = useConnect({
    onConnected: () => props.modal.closeModal(),
    // 失敗時は ConnectModal を閉じる。認証が必要なら LoginModal、
    // 接続できなければ ErrorModal が initialize 側から開かれる。
    onConnectFailed: () => props.modal.closeModal(),
  })

  return (
    <Root>
      <Header>
        <Heading isTruncated={true} tx="connectScreen.welcome" />
        <CloseButton onPress={() => props.modal.closeModal()} />
      </Header>
      <Body>
        <ConnectContent
          control={form.control}
          baseUrl={baseUrl}
          onSubmit={form.handleSubmit(onConnectPress)}
          submitDisabled={!form.formState.isValid}
        />
      </Body>
    </Root>
  )
})
