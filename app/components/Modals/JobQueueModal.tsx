import { Button } from "@/components/Button/Button"
import { Heading } from "@/components/Heading/Heading"
import { Text } from "@/components/Text/Text"
import { useStores } from "@/models"
import type { MessageKey } from "@/i18n"
import { api } from "@/services/api"
import type { CalibreJob } from "@/services/api/api.types"
import { HStack, ScrollView, VStack, View } from "@gluestack-ui/themed"
import { observer } from "mobx-react-lite"
import { useEffect, useRef, useState } from "react"
import { StyleSheet } from "react-native"
import type { ModalComponentProp } from "react-native-modalfy"
import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Footer } from "./ModalFooter"
import { Root } from "./Root"
import type { ModalStackParams } from "./Types"

export type JobQueueModalProps = ModalComponentProp<ModalStackParams, void, "JobQueueModal">

export const JobQueueModal = observer((props: JobQueueModalProps) => {
  const { calibreRootStore } = useStores()
  const selectedLibrary = calibreRootStore.selectedLibrary
  const [jobs, setJobs] = useState<CalibreJob[]>([])
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchJobs = async () => {
    if (!selectedLibrary?.id) return
    setLoading(true)
    try {
      const result = await api.getJobs(selectedLibrary.id)
      if (result.kind === "ok") {
        setJobs(result.data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  useEffect(() => {
    const hasRunning = jobs.some((j) => j.running)
    if (hasRunning) {
      intervalRef.current = setInterval(fetchJobs, 3000)
    } else {
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current != null) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [jobs, fetchJobs])

  const getStatusTx = (job: CalibreJob): MessageKey => {
    if (job.failed) return "jobQueue.failed"
    if (job.done) return "jobQueue.done"
    return "jobQueue.running"
  }

  const getStatusColor = (job: CalibreJob) => {
    if (job.failed) return "$red500"
    if (job.done) return "$green500"
    return "$blue500"
  }

  return (
    <Root>
      <Header>
        <Heading tx="jobQueue.title" isTruncated={true} />
        <CloseButton onPress={() => props.modal.closeModal()} />
      </Header>
      <Body>
        <ScrollView>
          <VStack space="md" padding="$2">
            {jobs.length === 0 ? (
              <Text tx="jobQueue.noJobs" />
            ) : (
              jobs.map((job) => (
                <VStack key={job.id} space="xs" padding="$2" borderRadius="$md">
                  <Text numberOfLines={2} style={styles.jobName}>{job.name}</Text>
                  <HStack alignItems="center" space="sm">
                    <View flex={1} height={6} borderRadius="$full" backgroundColor="$backgroundLight300">
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${Math.round((job.percent ?? 0) * 100)}%`,
                            backgroundColor: getStatusColor(job),
                          },
                        ]}
                      />
                    </View>
                    <Text
                      tx={getStatusTx(job)}
                      style={{ color: getStatusColor(job), flexShrink: 0 }}
                    />
                  </HStack>
                </VStack>
              ))
            )}
          </VStack>
        </ScrollView>
      </Body>
      <Footer>
        <HStack space="sm">
          <Button
            onPress={fetchJobs}
            tx="jobQueue.refresh"
            isDisabled={loading}
          />
          <Button onPress={() => props.modal.closeModal()} tx="common.ok" />
        </HStack>
      </Footer>
    </Root>
  )
})

const styles = StyleSheet.create({
  jobName: {
    fontWeight: "500",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
})
