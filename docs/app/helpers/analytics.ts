export enum EventNames {
  OutboundLink = 'Outbound Link',
}

type EventFactory<
  TEventName extends EventNames,
  TAdditionalProps extends object = object
> = {
  name: TEventName
  additionalProps?: TAdditionalProps
}

type OutboundLinkEvent = EventFactory<
  EventNames.OutboundLink,
  {
    linkTitle: string
  }
>

type Events = OutboundLinkEvent

export const firePlausibleEvent = (event: Events) => {
  if (window.plausible) {
    window.plausible(event.name, { props: event.additionalProps })
  }
}
