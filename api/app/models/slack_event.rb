# frozen_string_literal: true

class SlackEvent
  class UnrecognizedTypeError < StandardError
    def message
      "unrecognized Slack event type"
    end
  end

  def self.from_params(params)
    if params[:type] == SlackEvents::UrlVerification::TYPE
      return SlackEvents::UrlVerification.new(params)
    end

    if params[:type] == SlackEvents::EventCallback::TYPE
      case params.dig(:event, :type)
      when SlackEvents::AppHomeOpened::TYPE
        return SlackEvents::AppHomeOpened.new(params)
      when SlackEvents::AppUninstalled::TYPE
        return SlackEvents::AppUninstalled.new(params)
      when SlackEvents::ChannelArchive::TYPE
        return SlackEvents::ChannelArchive.new(params)
      when SlackEvents::ChannelCreated::TYPE
        return SlackEvents::ChannelCreated.new(params)
      when SlackEvents::ChannelDeleted::TYPE
        return SlackEvents::ChannelDeleted.new(params)
      when SlackEvents::ChannelRename::TYPE
        return SlackEvents::ChannelRename.new(params)
      when SlackEvents::ChannelUnarchive::TYPE
        return SlackEvents::ChannelUnarchive.new(params)
      when SlackEvents::GroupArchive::TYPE
        return SlackEvents::GroupArchive.new(params)
      when SlackEvents::GroupDeleted::TYPE
        return SlackEvents::GroupDeleted.new(params)
      when SlackEvents::GroupLeft::TYPE
        return SlackEvents::GroupLeft.new(params)
      when SlackEvents::GroupRename::TYPE
        return SlackEvents::GroupRename.new(params)
      when SlackEvents::GroupUnarchive::TYPE
        return SlackEvents::GroupUnarchive.new(params)
      when SlackEvents::LinkShared::TYPE
        return SlackEvents::LinkShared.new(params)
      when SlackEvents::MemberJoinedChannel::TYPE
        return SlackEvents::MemberJoinedChannel.new(params)
      when SlackEvents::MemberLeftChannel::TYPE
        return SlackEvents::MemberLeftChannel.new(params)
      end
    end

    raise UnrecognizedTypeError
  end
end
