# frozen_string_literal: true

class SlackChannel
  def initialize(params)
    @params = params
  end

  def id
    @params["id"]
  end

  def name
    @params["name"]
  end

  def private?
    !!@params["is_private"]
  end
end
