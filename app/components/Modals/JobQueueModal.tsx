import { Button } from "@/components/Button/Button"
import { Heading } from "@/components/Heading/Heading"
import { Text } from "@/components/Text/Text"
import type { MessageKey } from "@/i18n"
import { useStores } from "@/models"
import type { ConversionJob } from "@/models/calibre"
import type { ApiConversionStatus, ApiConversionStatusFinished } from "@/services/api/api.types"
import { api } from "@/services/api"
import { HStack, ScrollView, VStack, View } from "@gluestack-ui/themed"
import { observer } from "mobx-react-lite"
import { useCallback, useEffect, useRef, useState } from "react"
import { StyleSheet } from "react-native"
import type { ModalComponentProp } from "react-native-modalfy"
import { Body } from "./Body"
import { CloseButton } from "./CloseButton"
import { Header } from "./Header"
import { Footer } from "./ModalFooter"
import { Root } from "./Root"
import type { ModalStackParams } from "./Types"

export type JobQueueModalProps = ModalComponentProp<ModalStackParams, void, "JobQueueModal">

type JobQueueItem = {
  id: string
  name: string
  percent: number
  running: boolean
  done: boolean
  failed: boolean
}

function buildTrackedJobItem(job: ConversionJob): JobQueueItem {
  return {
    id: `conversion:${job.id}`,
    name: job.bookTitle
      ? `${job.bookTitle} (${job.inputFormat} -> ${job.outputFormat})`
      : `${job.inputFormat} -> ${job.outputFormat}`,
    percent: job.percent ?? 0,
    running: job.status === "running",
    done: job.status === "done",
    failed: job.status === "failed" || job.status === "aborted",
  }
}

function isFinishedConversionStatus(
  status: ApiConversionStatus,
): status is ApiConversionStatusFinished {
  return status.running === false
}

export const JobQueueModal = observer((props: JobQueueModalProps) => {
  const { calibreRootStore } = useStores()
  const selectedLibrary = calibreRootStore.selectedLibrary
  const [jobs, setJobs] = useState<JobQueueItem[]>([])
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchJobs = useCallback(async () => {
    if (!selectedLibrary?.id) return
    setLoading(true)

    try {
      const trackedJobs = calibreRootStore.getConversionJobsForLibrary(selectedLibrary.id)
      const runningTrackedJobs = trackedJobs.filter((job) => job.status === "running")

      const trackedStatuses = await Promise.all(
        runningTrackedJobs.map(async (job) => ({
          job,
          result: await api.getConversionStatus(selectedLibrary.id, job.jobId),
        })),
      )

      for (const { job, result } of trackedStatuses) {
        // 404 = job already finished and removed from server, or expired
        if (result.kind === "not-found") {
          calibreRootStore.updateConversionJobFinished({
            libraryId: selectedLibrary.id,
            jobId: job.jobId,
            ok: false,
            wasAborted: false,
            traceback: null,
            log: null,
          })
          continue
        }

        if (result.kind !== "ok") {
          continue
        }

        if (result.data.running) {
          calibreRootStore.updateConversionJobRunning(
            selectedLibrary.id,
            job.jobId,
            result.data.percent,
            result.data.msg,
          )
        } else if (isFinishedConversionStatus(result.data)) {
          calibreRootStore.updateConversionJobFinished({
            libraryId: selectedLibrary.id,
            jobId: job.jobId,
            ok: result.data.ok,
            wasAborted: result.data.was_aborted,
            traceback: result.data.traceback,
            log: result.data.log,
            size: result.data.size,
            format: result.data.fmt,
          })
        }
      }

      const currentTrackedJobs = calibreRootStore.getConversionJobsForLibrary(selectedLibrary.id)
      setJobs(currentTrackedJobs.map(buildTrackedJobItem))
    } finally {
      setLoading(false)
    }
  }, [calibreRootStore, selectedLibrary?.id])

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

  const getStatusTx = (job: JobQueueItem): MessageKey => {
    if (job.failed) return "jobQueue.failed"
    if (job.done) return "jobQueue.done"
    return "jobQueue.running"
  }

  const getStatusColor = (job: JobQueueItem) => {
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
                  <Text numberOfLines={2} style={styles.jobName}>
                    {job.name}
                  </Text>
                  <HStack alignItems="center" space="sm">
                    <View
                      flex={1}
                      height={6}
                      borderRadius="$full"
                      backgroundColor="$backgroundLight300"
                    >
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
          <Button onPress={fetchJobs} tx="jobQueue.refresh" isDisabled={loading} />
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
