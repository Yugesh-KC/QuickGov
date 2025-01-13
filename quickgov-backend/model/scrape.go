package model

type PressRelease struct {
	date  string `selector:"td:nth-child(1)"`
	title string `selector:"td:nth-child(2) > a"`
	url   string `selector:"td:nth-child(2) > a[href]" attr:"href"`
}

type ImageData struct {
	page_url  string
	image_url string
}
