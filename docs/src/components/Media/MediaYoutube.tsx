import styled from 'styled-components'

export const YouTubeEmbed = ({ src }: { src: string }) => {
  return (
    <ResponsiveVideoContainer>
      <iframe
        width="853"
        height="480"
        src={src}
        frameBorder="0"
        allowFullScreen
      />
    </ResponsiveVideoContainer>
  )
}

const ResponsiveVideoContainer = styled.div`
  position: relative;
  padding-bottom: 56.25%;
  padding-top: 30px;
  height: 0;
  width: 100%;
  overflow: hidden;

  border-radius: 20px;
  border: 1px solid #e1e8ed;
  margin: 2em 0;

  & iframe,
  & object,
  & embed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`
