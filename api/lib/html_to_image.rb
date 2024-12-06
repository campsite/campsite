# frozen_string_literal: true

class HtmlToImage
  class HtmlToImageError < StandardError; end
  class ConnectionFailedError < HtmlToImageError; end
  class ServerError < HtmlToImageError; end

  def image(html:, theme: "light", width: 700, height: nil, device_scale_factor: nil, styles: nil)
    # override html+body background color
    # also override max-width of prose so it fills the screen
    wrapped_html = <<~HTML.strip
      <!DOCTYPE html>
      <html lang='en' style="background-color: transparent;">
        <head>
          <meta http-equiv='Content-Type' content='text/html' charset='utf-8' />
        </head>
        <body style="background-color: transparent;">
          <div class="prose" style="max-width: 100%;">
            #{html}
          </div>
        </body>
      </html>
    HTML

    body = {
      html: wrapped_html,
      styles: styles || application_styles,
      theme: theme,
      width: width,
      height: height,
      deviceScaleFactor: device_scale_factor,
    }

    response = connection.post("/image", body.to_json, {
      "Content-Type": "application/json",
    })

    case response.status
    when 200
      response.body
    else
      raise ServerError
    end
  rescue Faraday::ConnectionFailed
    raise ConnectionFailedError
  end

  private

  def application_styles
    @application_styles ||= Rails.root.join("app/assets/builds/application.css").read
  end

  def connection
    @connection ||= Faraday.new(
      url: Campsite.base_html_to_image_url,
    )
  end
end
