import React from "react"
import { Controller, type ControllerProps, type FieldValues } from "react-hook-form"

import { RatingGroup, type RatingGroupProps } from "../RatingGroup/RatingGroup"

export type FormRatingGroupProps<T> = Omit<RatingGroupProps, "onSelectRating" | "selectedValue"> &
  Omit<ControllerProps<T>, "render">
export function FormRatingGroup<T extends FieldValues>(props: FormRatingGroupProps<T>) {
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
            selectedValue={renderProps.field.value as number}
            ref={renderProps.field.ref}
          />
        )
      }}
    />
  )
}
