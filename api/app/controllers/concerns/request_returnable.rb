# frozen_string_literal: true

module RequestReturnable
  extend ActiveSupport::Concern

  def render_json(serializer, resource, opts = {})
    json = serializer.preload_and_render(
      resource,
      organization: current_organization,
      user: opts[:user],
      member: opts[:member],
      options: opts,
    )

    render(status: opts[:status], json: json)
  end

  def render_page(serializer, resources, opts = {})
    pagination = CursorPagination.new(
      scope: resources,
      before: params[:before],
      after: params[:after],
      limit: params[:limit],
      order: opts[:order],
    ).run

    render_json(serializer, pagination, opts)
  end
end
