# frozen_string_literal: true

class HmsEvent
  def self.from_params(params)
    case params["type"]
    when HmsEvents::SessionOpenSuccessEvent::TYPE
      HmsEvents::SessionOpenSuccessEvent.new(params)
    when HmsEvents::SessionCloseSuccessEvent::TYPE
      HmsEvents::SessionCloseSuccessEvent.new(params)
    when HmsEvents::PeerJoinSuccessEvent::TYPE
      HmsEvents::PeerJoinSuccessEvent.new(params)
    when HmsEvents::PeerLeaveSuccessEvent::TYPE
      HmsEvents::PeerLeaveSuccessEvent.new(params)
    when HmsEvents::BeamStartedSuccessEvent::TYPE
      HmsEvents::BeamStartedSuccessEvent.new(params)
    when HmsEvents::BeamStoppedSuccessEvent::TYPE
      HmsEvents::BeamStoppedSuccessEvent.new(params)
    when HmsEvents::BeamRecordingSuccessEvent::TYPE
      HmsEvents::BeamRecordingSuccessEvent.new(params)
    when HmsEvents::BeamFailureEvent::TYPE
      HmsEvents::BeamFailureEvent.new(params)
    when HmsEvents::TranscriptionStartedSuccessEvent::TYPE
      HmsEvents::TranscriptionStartedSuccessEvent.new(params)
    when HmsEvents::TranscriptionSuccessEvent::TYPE
      HmsEvents::TranscriptionSuccessEvent.new(params)
    when HmsEvents::TranscriptionFailureEvent::TYPE
      HmsEvents::TranscriptionFailureEvent.new(params)
    end
  end
end
