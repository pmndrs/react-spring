export enum EventNames {
  OutboundLink = 'Outbound Link',
  DocLiked = 'Doc Liked',
  DocDisliked = 'Doc Disliked',
  LinkedToSandbox = 'Linked to Sandbox',
}

type EventFactory<
  TEventName extends EventNames,
  TAdditionalProps extends object = object,
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

type VotingEvent = EventFactory<
  EventNames.DocLiked | EventNames.DocDisliked,
  {
    location: string
    title: string
  }
>

type SandboxEvent = EventFactory<
  EventNames.LinkedToSandbox,
  {
    title: string
  }
>

type Events = OutboundLinkEvent | VotingEvent | SandboxEvent

export const firePlausibleEvent = (event: Events) => {
  if (window.plausible) {
    window.plausible(event.name, { props: event.additionalProps })
  }
}
