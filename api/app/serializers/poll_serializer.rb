# frozen_string_literal: true

class PollSerializer < ApiSerializer
  api_field :public_id, name: :id
  api_field :description
  api_field :votes_count, type: :number
  api_association :options, is_array: true, blueprint: PollOptionSerializer do |poll|
    poll.options.sort_by(&:id)
  end

  api_field :viewer_voted, type: :boolean do |poll, options|
    preloaded = PostSerializer.preloads(options, :viewer_voted_option_ids_by_poll_id)

    if preloaded.nil?
      poll.voted?(options[:member])
    else
      preloaded.keys.include?(poll.id)
    end
  end
end
