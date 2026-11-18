<?xml version="1.0" encoding="UTF-8"?>
<StyledLayerDescriptor version="1.0.0" 
    xsi:schemaLocation="http://www.opengis.net/sld StyledLayerDescriptor.xsd" 
    xmlns="http://www.opengis.net/sld" 
    xmlns:ogc="http://www.opengis.net/ogc" 
    xmlns:xlink="http://www.w3.org/1999/xlink" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <NamedLayer>
    <Name>batas_provinsi_kalimantan_style</Name>
    <UserStyle>
      <Title>Symbology Tematik Karhutla &amp; Batas Administrasi Kalimantan</Title>
      <Abstract>Pewarnaan tematik transparan berbasis status kerawanan karhutla dengan label provinsi</Abstract>
      <FeatureTypeStyle>
        
        <!-- 1. Prioritas Siaga I (Merah Transparan) -->
        <Rule>
          <Name>Siaga_I</Name>
          <Title>Prioritas Siaga I</Title>
          <ogc:Filter>
            <ogc:PropertyIsLike wildCard="*" singleChar="." escape="!">
              <ogc:PropertyName>status_kerawanan</ogc:PropertyName>
              <ogc:Literal>*Siaga I*</ogc:Literal>
            </ogc:PropertyIsLike>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#ef4444</CssParameter>
              <CssParameter name="fill-opacity">0.32</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#b91c1c</CssParameter>
              <CssParameter name="stroke-width">2.2</CssParameter>
              <CssParameter name="stroke-opacity">0.95</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

        <!-- 2. Siaga II Karhutla (Oranye Transparan) -->
        <Rule>
          <Name>Siaga_II</Name>
          <Title>Siaga II Karhutla</Title>
          <ogc:Filter>
            <ogc:PropertyIsLike wildCard="*" singleChar="." escape="!">
              <ogc:PropertyName>status_kerawanan</ogc:PropertyName>
              <ogc:Literal>*Siaga II*</ogc:Literal>
            </ogc:PropertyIsLike>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#f97316</CssParameter>
              <CssParameter name="fill-opacity">0.30</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#c2410c</CssParameter>
              <CssParameter name="stroke-width">2.0</CssParameter>
              <CssParameter name="stroke-opacity">0.95</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

        <!-- 3. Waspada (Kuning Emas Transparan) -->
        <Rule>
          <Name>Waspada</Name>
          <Title>Waspada</Title>
          <ogc:Filter>
            <ogc:PropertyIsLike wildCard="*" singleChar="." escape="!">
              <ogc:PropertyName>status_kerawanan</ogc:PropertyName>
              <ogc:Literal>*Waspada*</ogc:Literal>
            </ogc:PropertyIsLike>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#eab308</CssParameter>
              <CssParameter name="fill-opacity">0.25</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#a16207</CssParameter>
              <CssParameter name="stroke-width">1.8</CssParameter>
              <CssParameter name="stroke-opacity">0.90</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

        <!-- 4. Luar Wilayah Kajian (Abu-Abu Tipis) -->
        <Rule>
          <Name>Luar_Kajian</Name>
          <Title>Luar Wilayah Kajian</Title>
          <ogc:Filter>
            <ogc:PropertyIsLike wildCard="*" singleChar="." escape="!">
              <ogc:PropertyName>status_kerawanan</ogc:PropertyName>
              <ogc:Literal>*Luar*</ogc:Literal>
            </ogc:PropertyIsLike>
          </ogc:Filter>
          <PolygonSymbolizer>
            <Fill>
              <CssParameter name="fill">#94a3b8</CssParameter>
              <CssParameter name="fill-opacity">0.08</CssParameter>
            </Fill>
            <Stroke>
              <CssParameter name="stroke">#64748b</CssParameter>
              <CssParameter name="stroke-width">1.0</CssParameter>
              <CssParameter name="stroke-dasharray">4 4</CssParameter>
              <CssParameter name="stroke-opacity">0.5</CssParameter>
            </Stroke>
          </PolygonSymbolizer>
        </Rule>

        <!-- 5. Label Nama Provinsi -->
        <Rule>
          <Name>Label_Provinsi</Name>
          <Title>Label Nama Provinsi</Title>
          <ogc:Filter>
            <ogc:PropertyIsNotEqualTo>
              <ogc:PropertyName>status_kerawanan</ogc:PropertyName>
              <ogc:Literal>Luar Wilayah Kajian</ogc:Literal>
            </ogc:PropertyIsNotEqualTo>
          </ogc:Filter>
          <TextSymbolizer>
            <Label>
              <ogc:PropertyName>WADMPR</ogc:PropertyName>
            </Label>
            <Font>
              <CssParameter name="font-family">Segoe UI</CssParameter>
              <CssParameter name="font-size">12</CssParameter>
              <CssParameter name="font-style">normal</CssParameter>
              <CssParameter name="font-weight">bold</CssParameter>
            </Font>
            <LabelPlacement>
              <PointPlacement>
                <AnchorPoint>
                  <AnchorPointX>0.5</AnchorPointX>
                  <AnchorPointY>0.5</AnchorPointY>
                </AnchorPoint>
              </PointPlacement>
            </LabelPlacement>
            <Halo>
              <Radius>2.5</Radius>
              <Fill>
                <CssParameter name="fill">#ffffff</CssParameter>
                <CssParameter name="fill-opacity">0.9</CssParameter>
              </Fill>
            </Halo>
            <Fill>
              <CssParameter name="fill">#0f172a</CssParameter>
            </Fill>
            <VendorOption name="autoWrap">80</VendorOption>
            <VendorOption name="maxDisplacement">50</VendorOption>
            <VendorOption name="goodnessOfFit">0.3</VendorOption>
          </TextSymbolizer>
        </Rule>

      </FeatureTypeStyle>
    </UserStyle>
  </NamedLayer>
</StyledLayerDescriptor>
