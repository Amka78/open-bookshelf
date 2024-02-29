import React from "react"
import { Controller, ControllerProps } from "react-hook-form"

import { RatingGroup, RatingGroupProps } from "../RatingGroup/RatingGroup"

export type FormRatingGroupProps<T> = Omit<RatingGroupProps, "onSelectedRating" | "selectedValue"> &
  Omit<ControllerProps<T>, "render">
export function FormRatingGroup<T>(props: FormRatingGroupProps<T>) {
  return (
    <Controller
      {...props}
      render={(renderProps) => {
        return (
          <RatingGroup
            {...props}
            onSelectRating={(rating) => {
              renderProps.field.onChange(rating)
            }}
            seletedValue={renderProps.field.value as number}
            ref={renderProps.field.ref}
          />
        )
      }}
    />
  )
}
