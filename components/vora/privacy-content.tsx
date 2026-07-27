import type { VoraLocale } from './locale'

export const PRIVACY_UPDATED = '2026-07-28'

export function privacyUpdated(locale: VoraLocale) {
  return locale === 'ko' ? `시행일: ${PRIVACY_UPDATED}` : `Effective: July 28, 2026`
}

export function privacyLede(locale: VoraLocale) {
  return locale === 'ko'
    ? 'LODY STUDIO는 VORA를 제공하며, 이 처리방침은 서비스가 어떤 정보를 어떻게 처리하는지 설명합니다.'
    : 'LODY STUDIO provides VORA. This policy explains what information the service handles and how.'
}

function Chapter({
  index,
  title,
  children,
}: {
  index: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="vora-legal-chapter">
      <header className="vora-legal-chapter-head">
        <span className="vora-legal-chapter-index" aria-hidden="true">
          {index}
        </span>
        <h2 className="vora-legal-chapter-title">{title}</h2>
      </header>
      <div className="vora-legal-chapter-body">{children}</div>
    </section>
  )
}

export function PrivacyChapters({
  locale = 'en',
  whisperClassName,
}: {
  locale?: VoraLocale
  whisperClassName?: string
}) {
  if (locale === 'ko') {
    return (
      <>
        <Chapter index="01" title="처리자와 적용 범위">
          <p>
            VORA의 개인정보처리자는 LODY STUDIO(이하 “회사”)입니다. 이 방침은 VORA 앱과
            웹사이트에 적용됩니다. 현재 VORA에는 회원 계정이나 회사 서버를 이용한 클라우드
            동기화 기능이 없습니다.
          </p>
        </Chapter>

        <Chapter index="02" title="처리 목적·항목·보유기간">
          <p>VORA 앱은 핵심 기능 제공을 위해 다음 정보를 이용자의 기기에 저장합니다.</p>
          <ul className="vora-legal-list">
            <li>이용자가 작성한 문장(“Lights”): 개인 하늘 구성</li>
            <li>언어, 하늘 테마, 소리 및 알림 설정: 선택한 환경 유지</li>
            <li>앱 진입 여부, 시작일 등 기본 상태: 이용 흐름과 표시 상태 유지</li>
            <li>향후 스토어 결제가 연결되는 경우 기기의 구독·이용권 상태: 유료 기능 제공</li>
          </ul>
          <p>
            위 정보는 이용자가 앱·사이트 데이터를 삭제하거나 앱을 제거할 때까지 기기에
            보관됩니다. 현재 회사는 작성 문장을 회사 서버로 전송하거나 별도로 보관하지 않습니다.
          </p>
        </Chapter>

        <Chapter index="03" title="분석·광고 정보">
          <p>
            현재 VORA 앱과 웹사이트는 원격 이용 분석 도구나 맞춤형 광고 SDK를 실행하지 않습니다.
            이용자가 작성한 문장, 앱 이용 행동 또는 기기 식별자를 분석·광고 목적으로 회사 서버나
            광고 사업자에게 전송하지 않습니다.
          </p>
          <p>
            다만 웹사이트를 제공하고 보안을 유지하는 과정에서 호스팅 사업자가 IP 주소, 요청 시각,
            요청 URL, 브라우저·기기 정보와 보안 로그를 자동 처리할 수 있습니다. 회사는 이를 맞춤형
            광고나 사이트 간 추적에 사용하지 않습니다.
          </p>
        </Chapter>

        <Chapter index="04" title="제3자 제공·처리위탁·국외 처리">
          <p>
            회사는 이용자의 작성 문장을 제3자에게 판매하거나 광고 목적으로 제공하지 않습니다.
            이용자가 카드 저장 또는 공유를 직접 선택하면 해당 콘텐츠는 기기의 사진·파일·공유
            기능과 이용자가 선택한 외부 앱을 통해 처리됩니다.
          </p>
          <p>
            웹사이트 제공 및 보안을 위해 호스팅 사업자가 위 기술 로그를 대한민국 외의 서버에서
            처리할 수 있으며, 해당 로그는 호스팅 사업자의 보안·운영 보유정책에 따라 필요한
            기간 동안 보관됩니다. 현재 회사가 직접 운영하는 VORA 계정·클라우드 저장 또는 원격
            분석을 위한 위탁은 없습니다. 향후 이러한 기능이 추가되면 적용 법령에 따라 대상, 항목,
            목적, 국가, 이전 시기·방법과 보유기간을 사전에 알리고 필요한 동의를 받습니다.
          </p>
        </Chapter>

        <Chapter index="05" title="파기와 이용자의 권리">
          <p>
            이용자는 개별 Light를 앱에서 삭제할 수 있고, 앱·브라우저 저장공간을 지우거나 앱을
            제거하여 기기에 저장된 정보를 삭제할 수 있습니다. 회사가 보유한 개인정보에 대한 열람,
            정정·삭제, 처리정지 또는 동의 철회를 요청하려면 아래 개인정보 문의 연락처를 이용할 수
            있습니다. 회사가 해당 정보를 보유하지 않는 경우 그 사실을 안내합니다.
          </p>
        </Chapter>

        <Chapter index="06" title="안전성 확보 조치">
          <p>
            VORA는 작성 문장을 기본적으로 이용자 기기에만 저장하고, 전송 구간에는 운영 환경이
            제공하는 보안 통신을 사용하며, 필요한 범위로 접근을 제한합니다. 이용자가 외부 앱으로
            공유하거나 기기 자체가 손상된 경우에는 해당 기기 및 외부 서비스의 보안 정책이
            적용됩니다.
          </p>
        </Chapter>

        <Chapter index="07" title="아동의 개인정보">
          <p>
            VORA는 만 14세 미만 아동을 대상으로 개인정보를 수집하도록 설계되지 않았습니다. 회사가
            법정대리인 동의 없이 만 14세 미만 아동의 개인정보를 보유한 사실을 알게 되면 관련 법령에
            따라 지체 없이 삭제하거나 필요한 조치를 합니다.
          </p>
        </Chapter>

        <Chapter index="08" title="북미 지역 이용자의 권리">
          <p>
            미국 또는 캐나다의 개인정보 법령이 적용되는 경우, 이용자는 회사가 보유한 개인정보의
            열람·확인, 사본 제공, 정정, 삭제 또는 이동을 요청하고 동의를 철회할 수 있습니다. 해당
            법령이 보장하는 범위에서 개인정보의 판매·공유 또는 맞춤형 광고를 거부하고, 민감정보
            이용을 제한하며, 요청 결과에 이의를 제기할 수 있습니다. 회사는 권리 행사만을 이유로
            차별하지 않습니다.
          </p>
          <p>
            현재 VORA는 개인정보를 판매하거나 교차 맥락 행동광고를 위해 공유하지 않으며,
            맞춤형 광고를 제공하지 않습니다. 캐나다 이용자는 회사의 개인정보 보호 담당자에게
            문의한 후 캐나다 개인정보보호위원회 또는 관할 주 개인정보 감독기관에 민원을 제기할
            수 있습니다.
          </p>
        </Chapter>

        <Chapter index="09" title="변경·개인정보 문의">
          <p>
            기능 또는 개인정보 처리 방식이 바뀌면 시행 전에 앱 또는 공개 페이지를 통해 변경
            내용과 시행일을 알리고, 중대한 변경에는 필요한 동의 절차를 적용합니다.
          </p>
          <p className={whisperClassName ?? 'vora-legal-whisper'}>
            개인정보 보호 담당: LODY STUDIO 개인정보 보호 담당자
            <br />
            문의: VORA 공식 앱스토어 등록정보의 개발자 연락처
          </p>
        </Chapter>
      </>
    )
  }

  return (
    <>
      <Chapter index="01" title="Controller and scope">
        <p>
          LODY STUDIO (“we”) is the controller for VORA. This policy applies to the VORA app and
          website. The current version has no VORA account or company-operated cloud sync.
        </p>
      </Chapter>
      <Chapter index="02" title="Purpose, information, and retention">
        <p>VORA stores the following information on your device to provide its core features:</p>
        <ul className="vora-legal-list">
          <li>Sentences you write (“Lights”) to build your personal sky</li>
          <li>Language, sky theme, sound, and reminder preferences</li>
          <li>Basic app state, including entry state and start date</li>
          <li>On-device subscription or entitlement status if store billing is added later</li>
        </ul>
        <p>
          This information remains on your device until you delete app or site data or uninstall
          VORA. We do not currently upload or retain your Lights on LODY STUDIO servers.
        </p>
      </Chapter>
      <Chapter index="03" title="Analytics and advertising">
        <p>
          The current VORA app and website do not run remote usage analytics or personalized
          advertising SDKs. We do not transmit your Lights, app activity, or device identifiers to
          our servers or advertising providers for analytics or advertising.
        </p>
        <p>
          Our website host may automatically process an IP address, request time, requested URL,
          browser or device information, and security logs to deliver and protect the website. We
          do not use this information for personalized advertising or cross-site tracking.
        </p>
      </Chapter>
      <Chapter index="04" title="Sharing, processors, and international processing">
        <p>
          We do not sell your Lights or provide them for advertising. If you choose to save or share
          a card, your device and the external app you select process that content. Our website host
          may process essential technical logs on servers outside your country and retain them as
          reasonably necessary for hosting, security, and legal compliance. We currently have no
          processor for a VORA account, cloud storage, or remote analytics. If that changes, we will
          provide the disclosures and choices required by applicable law.
        </p>
      </Chapter>
      <Chapter index="05" title="Deletion and your rights">
        <p>
          You can delete individual Lights, clear app or browser storage, or uninstall VORA. You may
          request access, correction, deletion, restriction, or withdrawal of consent using the
          privacy contact below. If we do not hold the requested information, we will tell you.
        </p>
      </Chapter>
      <Chapter index="06" title="Security">
        <p>
          VORA keeps Lights on your device by default, uses transport security provided by the
          operating environment, and limits access to what the service needs. Your device and any
          external service you choose govern content after you share it.
        </p>
      </Chapter>
      <Chapter index="07" title="Children">
        <p>
          VORA is a general-audience service and is not directed to children under 13. We do not
          knowingly collect personal information online from a child under 13. If we learn that we
          have done so without verifiable parental consent where required, we will delete it or take
          other steps required by law. A higher minimum age applies where local law requires it.
        </p>
      </Chapter>

      <Chapter index="08" title="United States privacy notice">
        <p>
          Depending on where you live and whether the relevant law applies to us, you may have the
          right to know or access personal information, obtain a portable copy, correct it, delete
          it, opt out of sale, sharing, or targeted advertising, limit certain uses of sensitive
          information, appeal a decision, and receive equal service when exercising a privacy
          right. We may verify a request and may retain information where an exception applies.
        </p>
        <p>
          During the preceding 12 months, the website host may have processed identifiers such as IP
          address and internet or electronic activity such as requested URL, timestamp, browser,
          device, and security-log information. These come automatically from the browser or device
          and are used for hosting, security, debugging, and legal compliance. They may be disclosed
          to hosting and security service providers for those purposes. VORA has not sold personal
          information, shared it for cross-context behavioral advertising, or used sensitive
          personal information to infer characteristics. We therefore do not currently provide a
          “Do Not Sell or Share” link. If these practices change, we will provide required opt-outs
          and honor legally recognized preference signals, including Global Privacy Control where
          applicable.
        </p>
      </Chapter>

      <Chapter index="09" title="Canada privacy notice">
        <p>
          Where Canadian privacy law applies, you may request access to personal information we hold,
          challenge its accuracy and have it corrected, withdraw consent subject to legal or
          contractual restrictions, and ask how it has been used or disclosed. Collection, use,
          disclosure, and retention are limited to identified and reasonable purposes. You may
          challenge our compliance through the privacy contact below and then contact the Office of
          the Privacy Commissioner of Canada or the applicable provincial privacy authority.
        </p>
      </Chapter>

      <Chapter index="10" title="Changes and privacy contact">
        <p>
          We will post changes before they take effect and request consent where applicable law
          requires it.
        </p>
        <p className={whisperClassName ?? 'vora-legal-whisper'}>
          Privacy contact: LODY STUDIO privacy contact
          <br />
          Contact: the developer contact published on VORA’s official app-store listing
        </p>
      </Chapter>
    </>
  )
}
